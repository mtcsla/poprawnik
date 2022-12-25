import styled from "@emotion/styled";
import { DragHandle, Facebook, Instagram } from "@mui/icons-material";
import { Button, Paper, useTheme } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useWindowSize from '../hooks/WindowSize';
import LogoSVG from '../public/logo1.svg';


const LogoHeader = ({
	border,
	openSidebar,
	noText,
	caption,
	captionLink,
	social,
	png,
	noPadding,
	noBackground,
	noBackgroundImportant,
	inAccountPage,
	textWhite,
	noWidth,
	small,
	blueLight,
}: {
	blueLight?: boolean;
	border?: boolean;
	textWhite?: boolean;
	openSidebar?: () => void;
	png?: boolean;
	noText?: boolean;
	caption?: string;
	noPadding?: boolean;
	captionLink?: string;
	noBackground?: boolean;
	noBackgroundImportant?: boolean;
	social?: boolean;
	inAccountPage?: true;
	noWidth?: boolean;
	small?: boolean;
}) => {
	const theme = useTheme()
	const { width } = useWindowSize();
	const router = useRouter();

	const [rem, setRem] = React.useState(16);
	React.useEffect(
		() => {
			setRem(parseInt(document.documentElement.style.fontSize || '16px'))

			const getRem = (mutations: MutationRecord[]) => {
				setRem(parseInt(document.documentElement.style.fontSize || '16px'))
			}

			const mutationObserver = new window.MutationObserver(getRem)
			mutationObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['style']
			})

			return () => mutationObserver.disconnect()
		}, []
	)

	const TopComponent = styled(Paper) <{ noWidth: boolean | undefined }>`
  ${props => props.noWidth ? 'width: auto;' : 'width: 18rem;'}
      maxWidth: 320;
      height: 4rem;
  `


	return <TopComponent
		noWidth={noWidth}
		variant="outlined"
		classes={!border ? { root: "border-b-0" } : {}}
		className={
			`${noBackgroundImportant
				? 'bg-transparent'
				: `bg-${width != null && width >= 1100 && !noBackground ? 'white' : 'transparent'}
        `} rounded-none flex items-center border-l-0 border-t-0 border-r-0  
        ${noPadding
				? ''
				: `px-5 ${inAccountPage
					? ''
					: 'pr-3'} `}`
		}
	>
		{
			openSidebar ? (
				<Button
					sx={{ paddingLeft: "0.3rem", paddingRight: "0.3rem" }}
					onClick={openSidebar}
					size="small"
					className={"mr-3 bg-white"}
				>
					<DragHandle />
				</Button >
			) : null}

		<Link passHref href={router.pathname === '/' ? '/dashboard' : '/'}>
			<a className="mt-1">
				<Logo
					style={{}}
					png={true}
					color={theme.palette.primary.dark}
					height={rem * (small ? 2 : 3)}
					width={rem * (small ? 2 : 3)}
				/>
			</a>
		</Link>

		{
			noText ? null : (
				<div className={'flex justify-between w-full'}>
					<div className={'flex items-center'}>
						<div style={{ height: "2rem" }} className="border-l-2 ml-3 mr-3"></div>
						<div className="flex flex-col">
							<pre className={`p-0 pt-0 pb-0 text-sm ${textWhite ? 'text-white' : ''}`}>
								POPRAWNI<pre className={`inline font-bold text-blue-${blueLight ? 300 : 500}`}>K</pre>
							</pre>
							{captionLink ?
								<Link href={captionLink} passHref>
									<a className="text-xs pb-0 pt-0 text-blue-500">{caption || "Zrobimy wszystko za Ciebie."}</a>
								</Link>
								:
								<p className={`${textWhite ? 'text-slate-300' : ''} text-xs pb-0 pt-0`}>{caption || "Zrobimy wszystko za Ciebie."}</p>
							}
						</div>
					</div>
					{(social ?? true) ?
						<div className={`flex items-center justify-between pl-1.5 flex-col ${inAccountPage ? 'pr-4' : ''}`}>
							<Facebook className={textWhite ? 'text-white' : 'text-slate-500'} />
							<Instagram className={textWhite ? 'text-white' : 'text-slate-500'} />
						</div>
						: null
					}
				</div>
			)
		}
	</TopComponent>
}


export const Logo = ({ color, width, height, style, png, className }:
	{ color: string, width: number | string, height: number | string, png?: boolean, style: React.CSSProperties, className?: string }) => {
	return <Image src={png ? '/logo1.png' : LogoSVG} style={style} height={height} width={width} className={className} />
	/*<svg {...{ width, height, style, className }} viewBox="0 0 281 281" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="15" y="15" width="250" height="250" rx="40" fill="white" />
		<g filter="url(#filter0_d_1_2)">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M15 55C15 32.9086 32.9086 15 55 15H225C247.091 15 265 32.9086 265 55V98.4257C238.776 81.7258 201.525 85.4844 180.286 109.789C174.374 103.703 166.758 97.2832 157.374 90.5063C119.047 62.8285 116.709 60.464 116.528 51.0975C116.375 43.1781 121.512 35.3676 128.522 31.3931C141.183 24.2158 159.838 31.0423 156.4 47.2219C154.003 58.5022 159.642 66.6045 169.691 66.6045C183.306 66.6045 189.162 51.7281 181.358 37.2041C175.709 26.6921 156.972 20.7506 142.456 21.0081C127.939 21.2655 117.26 23.7167 109.724 28.8046C89.626 42.3725 86.9388 70.2409 104.211 88.2444L111.343 95.6785L99.3485 107.305C88.0691 118.239 83.9371 126.351 84.0011 138.892C73.1818 173.135 22.3369 171.304 15.1108 134.635L15 134.073V55ZM114.114 142.381C114.118 142.365 114.121 142.35 114.125 142.334L114.06 142.319C113.991 142.241 113.926 142.165 113.864 142.091C104.335 130.678 105.54 117.244 112.639 108.597L118.475 101.489L139.221 116.997C150.527 125.448 162.73 135.263 165.802 138.963C174.07 148.917 174.772 163.024 167.027 172.457L161.191 179.564L140.446 164.057C129.424 155.818 117.559 146.276 114.114 142.381ZM99.7053 171.477C78.5442 195.894 41.4605 199.841 15 183.711V225C15 247.091 32.9086 265 55 265H225C247.091 265 265 247.091 265 225V152.46L263.463 145.596C255.523 110.136 206.138 109.064 195.848 142.643C194.894 155.507 190.873 163.513 180.318 173.748L168.324 185.38L175.456 192.809C192.734 210.807 190.041 238.681 169.943 252.249C149.845 265.817 107.349 260.664 98.3039 243.849C90.493 229.329 96.3609 214.454 109.975 214.454C120.024 214.454 125.663 222.556 123.266 233.836C119.828 250.016 138.061 257.296 151.144 249.665C157.078 246.204 163.355 237.822 163.138 229.961C162.881 220.596 160.616 218.229 122.293 190.547C113.045 183.867 105.539 177.538 99.7053 171.477Z" fill={color} />
		</g>
		<defs>
			<filter id="filter0_d_1_2" x="11" y="15" width="258" height="258" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
				<feFlood flood-opacity="0" result="BackgroundImageFix" />
				<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
				<feOffset dy="4" />
				<feGaussianBlur stdDeviation="2" />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
				<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2" />
				<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape" />
			</filter>
		</defs>
	</svg>*/



}

export default LogoHeader;