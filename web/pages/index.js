import * as React from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from 'next/dynamic'

function Landing () {
	return (
		<React.Fragment>
			<Head>
				<meta charSet="utf-8" />
				<title>Timestack</title>
				<link href="css/normalize.css" rel="stylesheet" type="text/css" />
				<link href="css/webflow.css" rel="stylesheet" type="text/css" />
				<link href="css/timestack-e27068.webflow.css" rel="stylesheet" type="text/css" />
				<link href="https://fonts.googleapis.com" rel="preconnect" />
				<link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
				{/* [if lt IE 9]><![endif] */}
				<link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" />
				<link href="images/favicon.png" rel="apple-touch-icon" />
				<script
					async
					src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=63e0033ddd1066ec5a364425"
					type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
					crossOrigin="anonymous"></script>
				<script async src="js/webflow.js" type="text/javascript"></script>

			</Head>

			<div data-collapse="medium" data-animation="default" data-duration={0} data-easing="ease" data-easing2="ease" role="banner" className="navigation w-nav">
				<div className="navigation-items">
					<Link href="/" aria-current="page" className="logo-link w-nav-brand w--current"><img src="images/logo-blacktimestack.svg" width={25} alt="" className="logo-image" /></Link>
					<div className="navigation-wrap">
						<nav role="navigation" className="navigation-items w-nav-menu">
							<Link href="/" aria-current="page" className="navigation-item w-nav-link w--current">Home</Link>
							<a href="https://timestack.notion.site/About-us-f0fc3120a47a4ed8b08f3feee3f1f68f" className="navigation-item w-nav-link">Us</a>
							<a href="https://timestack.notion.site/Newsroom-ac244137876045259228edf1eccd203b" className="navigation-item w-nav-link">News</a>
							<a href="https://timestack.notion.site/Careers-9a94eafe02284018bf16fc0f11aa507d" className="navigation-item w-nav-link">Careers</a>
							<a href="https://timestack.notion.site/Privacy-ee3f202a9c654db0beca22753f41ebd3" className="navigation-item w-nav-link">Privacy</a>
							<a href="https://timestack.notion.site/Terms-of-Service-af4ae609b724485bb988d74dbee309ab" className="navigation-item w-nav-link">Terms</a>
							<a href="https://timestack.notion.site/Investors-bde35ce483f9469ca125ca75070663e9" className="navigation-item w-nav-link">Investors</a>
							<a href="https://timestack.notion.site/Contact-71f075977f1242259cff3aaa0e4f2bc2" className="navigation-item w-nav-link">Contact</a>
						</nav>
						<div className="menu-button w-nav-button"><img src="images/menu-icon_1menu-icon.png" width={22} alt="" className="menu-icon" /></div>
					</div>
				</div>
			</div>


			<div className="absolute-wrapper">
				<div className="section">
					<div className="container">
						<div className="intro-wrapper"><img src="images/logotype-blacktimestack.svg" loading="lazy" width={150} alt="" className="image" />
							<div style={{ maxWidth: "55ch",
								fontSize: "18px",
								lineHeight: "1.75",
								letterSpacing: "-0.05ch"}} className="paragraph-small">Timestack is a social network and memory repository.<br /><br />We believe sharing and preserving memories with those who’ve experienced them with us is one of the most magical things in our lives. But we just can’t seem to find a great way to do it together on the internet.<br /><br />We want to <strong>help you and I make great memories with the people we value and love</strong>.</div>
						</div>
						<div className="app-wrapper"><img src="images/Timestack.jpg" loading="lazy" sizes="(max-width: 767px) 60vw, (max-width: 991px) 48vw, 22vw" srcSet="images/Timestack.jpg 500w, images/Timestack.jpg 709w" alt="" className="full-image" />
							<a href="#" className="link-block w-inline-block" />
						</div>
					</div>
				</div>
			</div>



		</React.Fragment>
	);
}

export default dynamic(() => Promise.resolve(Landing), {
	ssr: false
})