import React from "react";
import Link from "next/link"

export default function Navbar () {
	return (
		<header className=" border-bottom">
			<div className="container">
				<div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
					<Link style={{padding: "0", margin: "0"}} href="/" className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
						<img style={{marginTop: "20px"}} className={"mb-4"} src={"/images/full.png"} alt={"Logo"} height={"40px"} />
					</Link>
					<ul className="nav col-12 col-lg-auto me-lg-auto mb-5 justify-content-center mb-md-0" style={{marginLeft: "20px"}}>
						{/*<li><a href="#" className="nav-link px-2 link-secondary">Your Events</a></li>*/}
						{/*<li><a href="#" className="nav-link px-2 link-secondary">Contacts</a></li>*/}
						{/*<li><a href="#" className="nav-link px-2 link-dark">Customers</a></li>*/}
						{/*<li><a href="#" className="nav-link px-2 link-dark">Products</a></li>*/}
					</ul>
					{/*<form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" data-dashlane-rid="cd9dc22de090398f" data-form-type>*/}
					{/*	<input type="search" className="form-control" placeholder="Search..." aria-label="Search" data-dashlane-rid="c158dcb2a56be05f" data-form-type />*/}
					{/*</form>*/}
					<div className="dropdown text-end">
						<Link href="#" className="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
							<img className={"shadow"} src="https://media.licdn.com/dms/image/D5603AQFytMf57CkM2A/profile-displayphoto-shrink_800_800/0/1669575632408?e=1677715200&v=beta&t=LsHtgqzWRkSVv0x1FGXZUfTI9qEVX1PAS_ZUERlyLCQ" alt="mdo" width={32} height={32} style={{borderRadius: "5px"}} />
						</Link>
						<ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
							{/*<li><a className="dropdown-item" href="#">New project...</a></li>*/}
							{/*<li><a className="dropdown-item" href="#">Settings</a></li>*/}
							{/*<li><a className="dropdown-item" href="#">Profile</a></li>*/}
							{/*<li><hr className="dropdown-divider" /></li>*/}
							<li><Link className="dropdown-item" href="/logout">Sign out</Link></li>
						</ul>
					</div>
				</div>
			</div>
		</header>

	);
}