import React from "react";
import {useRouter} from "next/router";

export default function EventCard ({
	name,
	location,
	startsAt,
	endsAt
}) {

	const router = useRouter();

	return (
		<div onClick={() => router.push("/event/ios_event")} className={"card "} style={{
			backgroundColor: "white",
			boxShadow: "rgba(100, 100, 111, 0.1) 0px 3px 29px 0px",
			borderRadius: "15px",
			marginBottom: "15px"
		}}>
			<div className={"row"}>
				<div className={"col-4"}>
					<img src={"events/thumb/Cassis 2022.jpg"} style={{borderRadius: "15px", objectFit: "cover"}} alt={"Cassis 2022"} width={"100%"} height={"130px"}/>
				</div>
				<div className={"col-5"} style={{paddingLeft: "0px"}}>
					<h6 style={{marginTop: "10px", marginBottom: "0px"}}><b>Cassis 2022</b></h6>
					<p style={{fontSize: "10px", marginBottom: "0px", marginLeft: "1px"}}>Cassis, France</p>
					<p style={{fontSize: "10px", marginLeft: "1px"}}>June 17 - 21, 2022
					</p>
					<div style={{position : "absolute",
						bottom   : 15}}>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/MingXi Profile.jpg"}/>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Flavia Profile.jpg"}/>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Dostie Profile.jpg"}/>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Frederique Profile.jpg"}/>

					</div>

				</div>
				<div className={"col-3"}>

					<p style={{fontSize: "10px", marginTop: "15px", marginLeft: "10px"}}>
						<img className={"red-apple"} src={"/icons/favorite_FILL0_wght400_GRAD0_opsz48.svg"} alt={"heart"} width={"12px"} style={{marginTop: "0px"}}/> 5<br/>
						<img className={"red-apple"} src={"/icons/image_FILL0_wght300_GRAD0_opsz48.svg"} alt={"heart"} width={"12px"} style={{marginTop: "0px"}}/> 404

					</p>
				</div>

			</div>

		</div>
	);

}