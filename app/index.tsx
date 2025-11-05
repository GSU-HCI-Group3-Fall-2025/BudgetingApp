import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { checkIsAuthenticated } from "./utils/AuthUtils";

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        const isAuth = await checkIsAuthenticated();
        setIsAuthenticated(isAuth);
    };

    if (isAuthenticated === null) {
        return null; // Loading state
    }

    return <Redirect href={isAuthenticated ? "/Dashboard" : "/Login"} />;
}