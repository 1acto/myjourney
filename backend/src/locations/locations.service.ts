import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationTypeEnum } from '@prisma/client';
import Supercluster from 'supercluster';
import vtpbf from 'vt-pbf';
import type { Feature, Point } from 'geojson';

type PointProps = { loc_id: number; loc_name: string; loc_type: string };
type ClusterAggProps = { type_counts?: Record<string, number> };

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(req: any) {
    //Validation
    console.log('Received request:', req);
    if (!req || !req.properties || !req.geometry) {
      throw new Error('Error: The request must be in GeoJSON format.');
    }
    try {
      // ข้อมูลทั่วไป
      const location = await this.prisma.location.create({
        data: {
          loc_name: req.properties.name,
          loc_address: req.properties.address,
          loc_postcode: req.properties.postcode,
          loc_subdistrict: req.properties.subdistrict,
          loc_district: req.properties.district,
          loc_province: req.properties.province,
          loc_type: req.properties.type || LocationTypeEnum.POI,
          created_by_id: req.properties.created_by_id || null,
          loc_is_delete: false,
        },
      });

      // Geometry things~
      if (req.geometry.coordinates) {
        // สร้าง geometry row
        await this.prisma.$executeRaw`
        ALTER TABLE "Location"
        ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326)
        `;
        // สร้าง GIST index สำหรับ spatial queries
        await this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_location_geom_gist 
        ON "Location" USING GIST (geom)
        `;
        // ใส่ long lat ลง geom
        await this.prisma.$executeRaw`
        UPDATE "Location"
        SET geom = ST_SetSRID(ST_MakePoint(${req.geometry.coordinates?.[0]}, ${req.geometry.coordinates?.[1]}), 4326)
        WHERE loc_id = ${location.loc_id}
        `;
      }
      return { locationID: location.loc_id };
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async createMany(req: any) {
    if (!req || !req.features || !Array.isArray(req.features)) {
      throw new Error('Error: The request must be in GeoJSON format.');
    }

    try {
      const result = await this.prisma.$transaction(
        async (prisma) => {
          // Ensure geometry column exists (only once)
          await prisma.$executeRaw`
          ALTER TABLE "Location"
          ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326)
        `;
          // สร้าง GIST index สำหรับ spatial queries
          await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS idx_location_geom_gist 
          ON "Location" USING GIST (geom)
        `;

          // Prepare bulk insert data
          const locationData = req.features.map((feature: any) => {
            const properties = feature.properties || {};
            return {
              loc_name: properties.name,
              loc_address: properties.address,
              loc_postcode: properties.postcode,
              loc_subdistrict: properties.subdistrict,
              loc_district: properties.district,
              loc_province: properties.province,
              loc_type: LocationTypeEnum.POI,
              created_by_id: properties.created_by_id || null,
              loc_is_delete: false,
            };
          });

          // Bulk insert locations and get returned records
          const insertedLocations = await prisma.location.createManyAndReturn({
            data: locationData,
            skipDuplicates: true,
            select: { loc_id: true },
          });

          // Build geometry update values for bulk update using returned IDs
          const geometryUpdates = insertedLocations
            .map((location, index) => {
              const feature = req.features[index];
              const lat = feature.geometry.coordinates?.[1];
              const long = feature.geometry.coordinates?.[0];

              if (lat && long) {
                return `(${location.loc_id}, ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326))`;
              }
              return null;
            })
            .filter(Boolean);

          if (geometryUpdates.length > 0) {
            // Bulk update geometry using VALUES clause
            await prisma.$executeRaw`
            UPDATE "Location" 
            SET geom = v.geom
            FROM (VALUES ${Prisma.raw(geometryUpdates.join(','))}) 
            AS v(loc_id, geom)
            WHERE "Location".loc_id = v.loc_id
          `;
          }

          return {
            message: `Added: ${req.features.length} locations`,
          };
        },
        {
          maxWait: 20000, // 20 seconds max wait
          timeout: 100000, // 30 seconds timeout
        },
      );
      // Invalidate cluster after bulk insert
      this.rebuildNeeded = true;
      return result;
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  async findAll() {
    try {
      // Get locations with their coordinates extracted from geometry
      const locations = await this.prisma.$queryRaw<any[]>`
        SELECT 
          loc_id, loc_name, loc_address, loc_postcode, loc_subdistrict, 
          loc_district, loc_province, loc_type, created_by_id, loc_is_delete, created_at,
          ST_X(geom) as loc_long, 
          ST_Y(geom) as loc_lat
        FROM "Location"
        WHERE loc_is_delete = false
      `;

      // Convert to GeoJSON Feature Collection
      const geojson = {
        type: 'FeatureCollection',
        features: locations
          .filter((location) => location.loc_lat && location.loc_long)
          .map((location) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.loc_long, location.loc_lat],
            },
            properties: {
              loc_id: location.loc_id,
              loc_name: location.loc_name,
              loc_address: location.loc_address,
              loc_postcode: location.loc_postcode,
              loc_subdistrict: location.loc_subdistrict,
              loc_district: location.loc_district,
              loc_province: location.loc_province,
              loc_type: location.loc_type,
              created_by_id: location.created_by_id,
              created_at: location.created_at,
            },
          })),
      };

      return geojson;
    } catch (error) {
      throw new Error(`Failed to find locations: ${error.message}`);
    }
  }

  async findLatestId() {
    return await this.prisma.location.findFirst({
      orderBy: { loc_id: 'desc' },
    });
  }

  async getLists() {
    try {
      const locations = await this.prisma.location.findMany();

      const list = locations.map((location) => ({
        loc_id: location.loc_id,
        loc_name: location.loc_name,
      }));

      return list;
    } catch (error) {
      throw new Error(`Failed to find locations: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      // Get location with coordinates extracted from geometry
      const location = await this.prisma.$queryRaw<any[]>`
      SELECT 
        loc_id, loc_name, loc_address, loc_postcode, loc_subdistrict, 
        loc_district, loc_province, loc_type, created_by_id, loc_is_delete, created_at,
        ST_X(geom) as loc_long, 
        ST_Y(geom) as loc_lat
      FROM "Location"
      WHERE loc_id = ${id} AND loc_is_delete = false
    `;

      if (!location || location.length === 0) {
        throw new Error(`Location with id ${id} not found`);
      }

      const locationData = location[0];

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [locationData.loc_long, locationData.loc_lat],
        },
        properties: {
          loc_id: locationData.loc_id,
          loc_name: locationData.loc_name,
          loc_address: locationData.loc_address,
          loc_postcode: locationData.loc_postcode,
          loc_subdistrict: locationData.loc_subdistrict,
          loc_district: locationData.loc_district,
          loc_province: locationData.loc_province,
          loc_type: locationData.loc_type,
          created_by_id: locationData.created_by_id,
          created_at: locationData.created_at,
        },
      };
    } catch (error) {
      throw new Error(`Failed to find location: ${error.message}`);
    }
  }

  async update(id: number, req: Request) {
    try {
      const location = await this.prisma.location.findUnique({
        where: { loc_id: id },
      });
      if (!location) {
        throw new Error(`Location with id ${id} not found`);
      }
      // await this.prisma.location.update({ where: { loc_id: id }, data: req.body });
      this.rebuildNeeded = true;
      return `Location with id ${id} updated successfully`;
    } catch (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const location = await this.prisma.location.findUnique({
        where: { loc_id: id },
      });
      if (!location) {
        throw new Error(`Location with id ${id} not found`);
      }
      await this.prisma.location.delete({ where: { loc_id: id } });
      this.rebuildNeeded = true;
      return { message: `Location with id ${id} removed successfully` };
    } catch (error) {
      throw new Error(`Failed to remove location: ${error.message}`);
    }
  }

  // In-memory Supercluster index
  private clusterIndex: Supercluster<PointProps, ClusterAggProps> | null = null;
  private rebuildNeeded = true;
  private building: Promise<void> | null = null;

  /**
   * 🗺️ CLUSTERING CONFIGURATION
   * These settings control how points are grouped together when zoomed out
   */
  private readonly clusterExtent = 512; // How detailed the tiles are (512 is standard)
  private readonly clusterMaxZoom = 12; // Stop clustering at zoom 12 (show individual points at zoom 13+)
  private readonly clusterMinZoom = 0; // Start clustering from zoom 0 (most zoomed out)
  private readonly clusterMinPoints = 2; // Need at least 2 points to make a cluster
  private readonly clusterRadius = 60; // Medium radius for clustering
  private readonly clusterNodeSize = 64; // Performance setting (higher = faster but uses more memory)
  private aggregateByType = false; // optional clusterProperties-like aggregation

  /**
   * 🏗️ BUILD CLUSTER INDEX
   * This method prepares all location data for clustering
   * Think of it like organizing dots on a map into groups
   */
  private async buildClusterIndex(): Promise<void> {
    // Step 1: Get all locations from database with their coordinates
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        loc_id, loc_name, loc_type,
        ST_X(geom) as loc_long, 
        ST_Y(geom) as loc_lat
      FROM "Location"
      WHERE loc_is_delete = false AND geom IS NOT NULL
    `;

    // Step 2: Convert database rows into GeoJSON format (standard map data format)
    const features: Feature<Point, PointProps>[] = rows
      .filter((r) => r.loc_lat != null && r.loc_long != null) // Only include valid coordinates
      .map((r) => ({
        type: 'Feature', // This is a map feature
        geometry: {
          type: 'Point', // It's a single point on the map
          coordinates: [Number(r.loc_long), Number(r.loc_lat)], // [longitude, latitude]
        },
        properties: {
          // Extra info about this location
          loc_id: Number(r.loc_id),
          loc_name: String(r.loc_name ?? ''),
          loc_type: String(r.loc_type ?? ''),
        },
      }));

    // Step 3: Create the clustering engine with our settings
    const index = new Supercluster<PointProps, ClusterAggProps>({
      radius: this.clusterRadius, // How close points need to be to group together
      maxZoom: this.clusterMaxZoom, // When to stop clustering
      minZoom: this.clusterMinZoom, // When to start clustering
      minPoints: this.clusterMinPoints, // Minimum points needed to form a cluster
      extent: this.clusterExtent, // Technical setting for tile precision
      nodeSize: this.clusterNodeSize, // Performance tuning
    });

    // Step 4: Load all our location data into the clustering engine
    index.load(features);

    // Step 5: Save the clustering engine for later use
    this.clusterIndex = index;
    this.rebuildNeeded = false; // Mark as up-to-date
  }

  /**
   * 🔄 ENSURE CLUSTER INDEX IS READY
   * Makes sure our clustering data is built and up-to-date
   */
  private async ensureClusterIndex(): Promise<void> {
    // If we already have a cluster index and it's current, we're good to go
    if (this.clusterIndex && !this.rebuildNeeded) return;

    // If we're not already building the index, start building it
    if (!this.building) {
      this.building = this.buildClusterIndex().finally(() => {
        this.building = null; // Clear the building flag when done
      });
    }

    // Wait for the building to complete
    await this.building;
  }

  /**
   * 🧩 GENERATE MAP TILE (MVT - Mapbox Vector Tile)
   * This creates a "piece" of the map that shows locations/clusters for a specific area
   *
   * Think of the map like a jigsaw puzzle:
   * - Each puzzle piece is a "tile"
   * - z = zoom level (how close you're looking)
   * - x, y = which piece of the puzzle horizontally and vertically
   *
   * @param z - Zoom level (0 = whole world, 18 = very close up)
   * @param x - Tile column (left to right)
   * @param y - Tile row (top to bottom)
   * @param opts - Optional settings like layer name
   * @returns Buffer containing the map tile data
   */
  async mvt(
    z: number,
    x: number,
    y: number,
    opts?: { layerName?: string; extent?: number },
  ): Promise<Buffer> {
    // Step 1: Clean up and validate the tile coordinates
    // Make sure z/x/y are valid whole numbers within reasonable bounds
    const zi = Math.max(0, Math.floor(z)); // Zoom level must be 0 or higher
    const maxXY = 1 << zi; // Maximum x/y for this zoom level (2^zi)
    const xi = Math.min(Math.max(0, Math.floor(x)), maxXY - 1); // Keep x within bounds
    const yi = Math.min(Math.max(0, Math.floor(y)), maxXY - 1); // Keep y within bounds

    // Step 2: Set up tile generation options
    const layerName = opts?.layerName ?? 'locations'; // Default layer name
    const extent = opts?.extent ?? this.clusterExtent; // How detailed the tile should be

    // Step 3: Make sure our clustering data is ready
    await this.ensureClusterIndex();

    // Step 4: Get the specific tile data from our clustering engine
    // This returns either clustered points or individual points depending on zoom level
    const tile = this.clusterIndex?.getTile(zi, xi, yi);

    // Step 5: If there's no data for this tile area, return empty
    if (!tile || !tile.features || tile.features.length === 0) {
      return Buffer.alloc(0); // Empty buffer = no data
    }

    // Step 6: Convert the tile data into MVT format (compressed map data)
    // This is the format that Mapbox/maps can understand and display
    const buf = vtpbf.fromGeojsonVt({ [layerName]: tile }, { extent });
    return buf as unknown as Buffer;
  }
}
