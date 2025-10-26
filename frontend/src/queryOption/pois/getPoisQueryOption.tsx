import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function getPoisQueryOption(){
    return queryOptions({
        queryKey: ["poi"],
        queryFn: fetchpoi, 
    });
}

    const fetchpoi = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/poi`);
        return res.data
    };
