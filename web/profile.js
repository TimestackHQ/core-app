import IOS from "./components/ios";
import Link from "next/link";

export default function Profile() {
	return (
		<IOS>
			<Link className={"btn btn-danger"} href={"/logout"}>
				Logout
			</Link>
		</IOS>
	);
}