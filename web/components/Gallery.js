import MediaView from "./MediaView";
import React from "react";

export default function Gallery ({gallery}) {

	console.log(gallery)
	return (
		<React.Fragment>
			{gallery?.map((publicId, i) => {
				return (
					<div key={i} className={"col-4"} style={{margin: 0, padding: 1}}>
						<MediaView publicId={publicId}/>
					</div>
				);
			})}
		</React.Fragment>
	);
}