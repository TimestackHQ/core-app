import React from "react";
import Link from "next/link";
import FadeIn from "react-fade-in";

const icons = {
	"leftArrow": "/icons/arrow_back_ios_FILL0_wght400_GRAD0_opsz48.svg"
}

export default function IOS ({
	children,
	main,
	buttons
}) {
  return (
		<div style={{backgroundColor: "white"}}>
			{main ? <FadeIn >
					<header style={{backgroundColor: "white", paddingBottom: "8px"}} className="d-flex flex-wrap mb-4 row fixed-top ">

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
					<header style={{backgroundColor: "white", paddingBottom: "8px"}} className="d-flex flex-wrap mb-4 row fixed-top ">
						<div className={"col-6"}>
							{buttons?.filter(button => button.position === "left").map((button, index) => {
								return <Link style={{whiteSpace: "nowrap"}} key={index} href={button.href}>
									<img style={{marginLeft: "20px"}} src={icons?.[button.icon]} alt="logo" width="25px"/>
								</Link>
							})}
						</div>
						<div className={"col-5 d-flex justify-content-end"}>
							{buttons?.filter(button => button.position !== "left").map((button, index) => {
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


			<FadeIn>
				{children}
			</FadeIn>


				<div className="footer fixed-bottom" style={{backgroundColor: "white", paddingTop: "5px"}}>
					<div className="container">
						<div className="row">
							<div className="col-3">
								<Link href={"/main_ios"}>
									<img style={{marginLeft: "30px"}} className={"float-right"} src={"/icons/home_FILL0_wght300_GRAD0_opsz48.svg"} width={"30px"}/>
								</Link>
							</div>
							<div className="col-2">
								<img  src={"/icons/calendar_view_day_FILL0_wght300_GRAD0_opsz48.svg"} width={"30px"}/>
							</div>
							<div className="col-2 text-center">
								<Link href={"/new"}>
									<img src={"/icons/TimePortal Black No Add.svg"} height={"30px"}/>
								</Link>
							</div>
							<div className="col-2 text-center">
								<img style={{marginLeft: "5px"}} src={"/icons/notifications_FILL0_wght300_GRAD0_opsz48.svg"} width={"30px"}/>
							</div>
							<div className="col-3 left">
								<Link href={"/profile"}>
									<img style={{marginLeft: "10px", borderRadius: "100px", borderColor: "black", borderWidth:"20px"}} src={"/images/mingxi.jpg"} width={"28px"}/>
								</Link>
							</div>
						</div>
					</div>


				</div>

		</div>


  )
}