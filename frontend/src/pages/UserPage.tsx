import { Card, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { useUser } from "@/hooks/useUser";

export default function UserPage() {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button color="primary" onPress={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      <Card className="max">
        <CardHeader className="flex gap-3">
          <Image
            alt="user avatar"
            height={40}
            radius="sm"
            src={user?.usr_avatar || ""}
            width={40}
          />
          <div className="flex flex-col">
            <div>
              <Chip className="me-2" color="primary" size="sm" variant="flat">
                {user?.usr_role_name || "Role not defined"}
              </Chip>
              {user?.usr_firstname} {user?.usr_lastname}
            </div>
            <p className="text-small text-default-500">
              {user?.usr_email || "Email not defined"}
            </p>
          </div>
        </CardHeader>
      </Card>
      <Button
        className="w-60 mt-3"
        color="danger"
        variant="flat"
        onPress={() => {
          window.location.href = "http://localhost:3001/auth/logout";
        }}
      >
        Logout
      </Button>
    </div>
  );
}
