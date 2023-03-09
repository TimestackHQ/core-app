import React from "react";
import Link from "next/link";
import FadeIn from "react-fade-in";
import Router, {useRouter} from "next/router";
import {useSelector} from "react-redux";
import ProfilePicture from "./ProfilePicture";
import NativeBridge, {shareLink, shareRawLink, modalView} from "../utils/nativeBridge";

export const icons = {
	"leftArrow": "/icons/arrow_back_ios_FILL0_wght400_GRAD0_opsz48.svg",
	"events": "/icons/calendar_view_day_FILL0_wght300_GRAD0_opsz48.svg",
	"share": "/icons/ios_share_FILL0_wght300_GRAD0_opsz48.svg"
}

export default function IOS ({
	children,
	main,
	buttons,
    timestackButtonLink,
	hideNavbar
}) {
	const router = useRouter();

	const user = useSelector(state => state.user);
	const notificationCount = useSelector(state => state.notificationCount);

	return (
		<div style={{backgroundColor: "white"}}>
			{main ? <FadeIn >
					<header style={{backgroundColor: "white", paddingBottom: "8px", paddingTop: "50px"}} className="d-flex flex-wrap mb-4 row fixed-top ">

						<div className={"col-2"}>
							<img style={{marginLeft: "20px"}} src="/icons/logo blacktimestack.svg" alt="logo" width="25px"/>
						</div>
						<div className={"col-9"}>
							<input
								className={"form-control form-control-sm"}
								style={{backgroundColor: "#EFEFF0", borderRadius: "10px", marginTop: "3px"}}
								type="text"
								placeholder="Search"
								aria-label="Search"
							/>
						</div>
					</header>
					<br/>
					<br/>
					<br/>
				</FadeIn>
				: <FadeIn >
					<header style={{backgroundColor: "white", paddingBottom: "8px", paddingTop: "50px"}} className="d-flex flex-wrap mb-4 row fixed-top ">
						<div className={"col-6"}>
							{buttons?.filter(button => button.position === "left").map((button, index) => {
								return <div onClick={() => button.href === "back" ? Router.back() : router.push(button.href)} style={{whiteSpace: "nowrap"}} key={index} href={button.href}>
									<img style={{marginLeft: "20px"}} src={icons?.[button.icon]} alt="logo" width="25px"/>
								</div>
							})}
						</div>
						<div className={"col-6 d-flex justify-content-end"} style={{paddingRight: "25px"}}>
							{buttons?.filter(button => button.position !== "left").map((button, index) => {
								if(button?.share) {
									return <img
										key={index}
										onClick={() => {
											shareRawLink(button.href);
										}}
										style={{marginLeft: "20px"}}
										src={icons?.[button.icon]}
										alt="logo"
										width="25px"
									/>
								}
								return <Link key={index} href={button.href}>
									<img style={{marginLeft: "20px"}} src={icons?.[button.icon]} alt="logo" width="25px"/>
								</Link>
							})}

						</div>
					</header>
					<br/>
					<br/>
					<br/>
				</FadeIn>
			}

				<div style={{height: "40px"}}/>
				{children}


				{!hideNavbar ? <div className="footer fixed-bottom" style={{backgroundColor: "white", paddingTop: "5px", paddingBottom: "40px"}}>
					<div className="container">
						{/*<FadeIn>*/}
							<div className="row">
								<Link className="col-3" href={"/main_ios"}>
									<img
										style={{marginLeft: "30px", marginTop: "5px"}}
										className={"float-right"}
										src={Router.pathname === "/main_ios" ? "/icons/home-black.svg" : "/icons/home_FILL0_wght300_GRAD0_opsz48.svg"}
										width={"30px"}
									/>
								</Link>
								<div className="col-2">
									<img style={{marginTop: "5px"}} src={"/icons/calendar_view_day_FILL0_wght300_GRAD0_opsz48.svg"} width={"30px"}/>
								</div>
								<div className="col-2 text-center" onClick={() => modalView("upload", timestackButtonLink)}>
									{/*<img src={"/icons/TimePortal Black No Add.svg"} height={"30px"}/>*/}
									<img src={Router.pathname === "/new" ? "/icons/new-black.svg" : "/icons/add_circle_FILL0_wght300_GRAD0_opsz48.svg"} height={"40px"}/>
								</div>

								<Link className="col-2 text-center" href={"/notifications"}>

									<div type="button" className="position-relative">
										<img style={{marginLeft: "5px", marginTop: "5px"}}
										     src={Router.pathname.includes("/notifications") ? "/icons/notifications_FILL1_wght300_GRAD0_opsz48.svg" : "/icons/notifications_FILL0_wght300_GRAD0_opsz48.svg"}
										     width={"30px"}/>
										{notificationCount !== 0 ? <span
											style={{
												margin: "10px",
												paddingLeft: notificationCount < 10 ? "6px" : "3px",
												marginBottom: "90px",
												fontSize: "11px",
												backgroundColor: "#E41E1E",
												textAlign: "center",
												width: "18px", height: "18px", borderRadius: "100%"}}
											className="position-absolute top-0 start-50 translate-middle badge">
										    {notificationCount < 10 ? notificationCount : "9+"}
										    <span className="visually-hidden">unread notifications</span>
										  </span> : null}
									</div>

								</Link>
								<Link className="col-3 left" href={"/profile"}>
									<img style={{marginLeft: "10px", border:Router.pathname.startsWith("/profile") ? "2px solid black" : "2px solid white", marginTop: "5px", borderRadius: "100px", objectFit: "cover"}} src={user.profilePictureSource ? user.profilePictureSource :"/icons/contact.svg"} width={"30px"} height={"30px"}/>
								</Link>
							</div>
						{/*</FadeIn>*/}

					</div>


				</div> : null}

		</div>


  )
}