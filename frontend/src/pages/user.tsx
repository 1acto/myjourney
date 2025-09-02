import React, { useState } from "react";
import axios from "axios";
import { Card, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

export interface UserDTO {
  usr_id: number;
  usr_firstname: string;
  usr_lastname: string;
  usr_email: string;
  usr_avatar: string;
  usr_role_name: string;
}

export default function UserPage() {
  React.useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:3001/user/whoami");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const [user, setUser] = useState<UserDTO | null>(null);
  //fech setup

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
