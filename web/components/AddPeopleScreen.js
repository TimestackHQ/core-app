import IOS from "./ios";
import FadeIn from "react-fade-in";
import CoverPicture from "./CoverPicture";
import HTTPClient from "../utils/httpClient";
import React, {useEffect} from "react";
import Image from "next/image";

export default function AddPeopleScreen ({callback}) {

	// useEffect(() => {
	window.ReactNativeWebView.postMessage("hey");
	// },[])
	return (

		<FadeIn>
				<br/>
				<div className={"row"}>
					<div className={"col-10"}>
						<h3>
							<b>People</b>
						</h3>
					</div>
					<div className={"col-2 text-right"}>
						<div onClick={() => {callback()}}>
							<Image src={"/icons/times.svg"} width={20} height={20} alt={""}/>
						</div>
					</div>

					<div className={"col-12"}>
						<input
							className={"form-control"}
							style={{backgroundColor: "#EFEFF0", borderRadius: "10px", marginTop: "3px"}}
							type="text"
							placeholder="Search"
							aria-label="Search"
							autoFocus={true}
						/>
						<hr style={{marginBottom: 0}}/>
						<p style={{color: "gray", paddingTop: "0px"}}>0 people, 0 pending</p>

						<div className={"row"}>
							<div className={"col-3"}>
								<img width="80%" style={{borderRadius: "60px", marginRight: "5px"}} src={"/events/pics/MingXi Profile.jpg"}/>
							</div>
							<div className={"col-8"} style={{paddingLeft: "0px"}}>
								<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>MingXi</b></h5>
								<p style={{color: "gray", marginBottom: "0px"}}>@mingxi</p>
							</div>
							<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
								<i className={"fa fa-circle-check"}/>
							</div>
							<span style={{marginBottom: "8px"}}/>
						</div>
						<div className={"row"}>
							<div className={"col-3"}>
								<img width="80%" style={{borderRadius: "60px", marginRight: "5px"}} src={"/events/pics/Flavia Profile.jpg"}/>
							</div>
							<div className={"col-8"} style={{paddingLeft: "0px"}}>
								<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>MingXi</b></h5>
								<p style={{color: "gray", marginBottom: "0px"}}>@mingxi</p>
							</div>
							<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
								<i className={"fa fa-circle-check"}/>
							</div>
							<span style={{marginBottom: "8px"}}/>

						</div>
						<div className={"row"}>
							<div className={"col-3"}>
								<img width="80%" style={{borderRadius: "60px", marginRight: "5px"}} src={"/events/pics/Dostie Profile.jpg"}/>
							</div>
							<div className={"col-8"} style={{paddingLeft: "0px"}}>
								<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>MingXi</b></h5>
								<p style={{color: "gray", marginBottom: "0px"}}>@mingxi</p>
							</div>
							<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
								<i className={"fa fa-circle-"}/>
							</div>
						</div>




						<br/><br/><br/><br/>
						<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
						<br/><br/>



					</div>
				</div>


		</FadeIn>
	);

}