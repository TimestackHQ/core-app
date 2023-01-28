import IOS from "../components/ios";
import Link from "next/link";

export default function Profile() {
	return (
		<IOS>
			<div className={"container"}>
				<Link className={"btn btn-danger"} href={"/logout"}>
					Logout
				</Link>
			</div>
		</IOS>
	);
}