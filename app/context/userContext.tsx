import { createContext, useContext, useState } from "react";

interface UserContextType {
	isLoggedIn: boolean;
	userId: number | null;
	username: string | null;
	user: { uid: number; username: string } | null;
	setLogin: (uid: number, username: string) => void;
	logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userId, setUserId] = useState<number | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [user, setUser] = useState<UserContextType["user"]>(null);
	const setLogin = (uid: number, username: string) => {
		setIsLoggedIn(true);
		setUserId(uid);
		setUsername(username);
		setUser({ uid, username });
	}
	const logout = () => {
		setIsLoggedIn(false);
		setUserId(null);
	}

	return (
		<UserContext.Provider value={{ isLoggedIn, userId, username, user, setLogin, logout }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (!context) throw new Error("useUser must be used within a UserProvider");
	return context;
}

