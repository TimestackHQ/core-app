import React, {Fragment} from 'react';
import IOS from "../../components/ios";
import FadeIn from "react-fade-in";

export default function EventIOS ({}) {
	return (
		<IOS buttons={[
			{
				icon: "leftArrow",
				href: "/main_ios",
				position: "left"
			},
			// {
			// 	icon: "leftArrow",
			// 	href: "/main_ios",
			// }
		]}>
			<FadeIn className="container">
				<div className={"row"}>
					<div className={"col-5"}>
						<img src={"/events/thumb/Cassis 2022.jpg"} style={{borderRadius: "15px", objectFit: "cover"}} alt={"Cassis 2022"} width={"100%"} height={"230px"}/>
					</div>
					<div className={"col-7"}>
						<h2 className={"overflow-auto"} style={{marginBottom: "0px", lineHeight: "1", maxHeight: "52px"}}><b>McGill Undergraduatesociety meeting</b></h2>
						<p style={{fontSize: "12px", marginBottom: "0px", marginLeft: "2px"}}>Cassis, France</p>
						<p style={{fontSize: "12px", marginLeft: "2px"}}>June 17 - 21, 2022</p>
					</div>
				</div>
			</FadeIn>
		</IOS>
	);
}