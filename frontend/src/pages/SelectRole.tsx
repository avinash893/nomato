import { useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { authService } from "../config";
import { useNavigate } from "react-router-dom";

type Role = "customer" | "rider"| "seller"| null;

const SelectRole = () => {
    const [role, setRole] = useState<Role>(null);
    const { setUser } = useAppData();
    const navigate = useNavigate();

    const roles: Role[] = ["customer", "rider", "seller"];

    const addRole = async () => {
        if (!role) return;
        try {
            // Use PUT instead of POST, and the matching endpoint /api/auth/add/role
            const { data } = await axios.put(`${authService}/api/auth/add/role`, { role }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });

            localStorage.setItem("token", data.token);
            setUser(data.user);
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-md text-center">
                <h1 className="text-3xl font-bold text-[#333]">Select Role</h1>
                <div className="flex flex-col gap-4">
                    {roles.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`rounded px-4 py-2 capitalize border ${role === r ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                <button onClick={addRole} disabled={!role} className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 font-semibold disabled:opacity-50 mt-4">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default SelectRole;
