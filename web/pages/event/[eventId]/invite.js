import * as React from "react";
import dynamic from 'next/dynamic'




const DynamicHeader = dynamic(() => import('../../../components/Invite'), {
	ssr: false,
})

export default () => <DynamicHeader />