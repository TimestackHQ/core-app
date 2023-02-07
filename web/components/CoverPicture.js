import React from "react";

export default function CoverPicture({setCover}) {

	const [coverPicture, setCoverPicture] = React.useState(null);

	React.useEffect(() => {
		setCover(coverPicture);
	}, [coverPicture]);
	return (
		<div className="image-upload">
		  <h6 style={{color: "gray"}}>
			  Add cover {coverPicture && <button className={"btn btn-sm btn-outline-danger"} onClick={() => setCoverPicture(null)}><i className={"fa fa-times"}/></button>}
		  </h6>
		  <label htmlFor="file-input">
			  {coverPicture ?
				  <img style={{borderRadius: "15px", objectFit: "cover"}} alt={"Cassis 2022"} width={"130px"} height={"160px"} src={URL.createObjectURL(coverPicture)}/>
				  :  <img width="130px"  src={"/icons/add-event-cover.svg"}/>
			  }
		  </label>

		  <input id={"file-input"} type="file" onChange={(e) => {
			  setCoverPicture(e.target.files[0]);
		  }}/><br/><br/>
		</div>
	);
}