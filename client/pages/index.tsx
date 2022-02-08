import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ethers } from 'ethers'
import 'react-toastify/dist/ReactToastify.css'
import abi from '../utils/CoffeePortal.json'

import coffeeImg from './Vector.png'

import Image from 'next/image'
import Head from 'next/head'

export default function Home() {
  const contractAddress = '0xf69B9fF4e27535ce18887A335749BD1297d89553'

  const contractABI = abi.abi

  const [currAccount, setCurrAccount] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [allCoffee, setAllCoffee] = useState([] as any)
  const [count, setCount] = useState(0)

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window

      //Check if user is logged in
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        //set the current account
        setCurrAccount(accounts[0])
        toast.success('🙌 Wallet is Connected!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          progress: undefined,
        })
      } else {
        toast.warn('❌ Wallet is not Connected!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          progress: undefined,
        })
      }
    } catch (err: any) {
      toast.error(`${err.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        progress: undefined,
      })
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (currAccount) {
        toast.warn("You're already connected!")
      }

      //check if the wallet is connected
      if (!ethereum) {
        toast.warn('Make sure you have metamask installed/connected', {
          position: 'top-right',
        })
        return
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setCurrAccount(accounts[0])
    } catch (err: any) {
      console.log(err)
      toast.error(`${err.message}`, {
        position: 'top-right',
      })
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await contract.getTotalCoffee()
        console.log(`Retrieved ${count} coffees`)
        let coffeeTx = await contract.buyCoffee(
          message ? message : 'Message is didnt provided',
          name ? name : 'Anonymous',
          ethers.utils.parseEther('0.001'),
          {
            gasLimit: 300000,
          }
        )

        console.log('Transaction is mining...', coffeeTx.hash)

        toast.info('Waiting for transaction, please wait...', {
          position: 'top-left',
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })

        await coffeeTx.wait()

        console.log('Mined --', coffeeTx.hash)

        count = await contract.getTotalCoffee()
        console.log('Total coffees --', count.toNumber())
        setCount(count + 1)

        setMessage('')
        setName('')

        toast.success('🙌 Coffee Purchased!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          progress: undefined,
        })
      } else {
        console.log('No wallet found')
      }
    } catch (err: any) {
      toast.error(`${err.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        progress: undefined,
      })
      console.log(err)
    }
  }

  //Get all coffee from the contract
  const getAllCoffee = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        //Call getAllCoffee function from contract
        const coffees = await contract.getCoffees()

        //Get name, message, address, and timestamp from the coffees
        const coffeeArray = coffees.map((coffee: any) => {
          return {
            name: coffee.name,
            timestamp: new Date(coffee.timestamp * 1000),
            message: coffee.message,
            address: coffee.giver,
          }
        })

        setAllCoffee(coffeeArray)
      } else {
        console.log('No wallet found')
      }
    } catch (err: any) {
      console.log(err)
      toast.error('Something went wrong, please try again later...', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        progress: undefined,
      })
    }
  }

  useEffect(() => {
    let contract: any
    getAllCoffee()
    isWalletConnected()

    const onNewCoffe = (
      from: string,
      timestamp: any,
      message: string,
      name: string
    ) => {
      setAllCoffee((prevState: any) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      contract = new ethers.Contract(contractAddress, contractABI, signer)
      contract.on('NewCoffee', onNewCoffe)
    }

    return () => {
      if (contract) {
        contract.off('NewCoffee', onNewCoffe)
      }
    }
  }, [])

  useEffect(() => {
    getAllCoffee()
  }, [count])

  const handleMessage = (event: any) => {
    const { value } = event.target
    setMessage(value)
  }

  const handleName = (event: any) => {
    const { value } = event.target
    setName(value)
  }

  return (
    <div className=" flex min-h-screen w-full flex-col items-center justify-center  bg-[#10132D]">
      <Head>
        <title>Buy Me a Coffee</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {currAccount ? (
        <main className="glass_effect z-10 mt-24 mb-10 flex h-[640px] w-[500px] flex-col items-center justify-evenly rounded-lg">
          <h1 className="text-2xl font-bold uppercase text-white">
            Buy Me A Coffee
          </h1>
          <form className="w-4/5 ">
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-white">
                Name:
              </label>
              <input
                id="name"
                onChange={handleName}
                required
                type="text"
                className="w-full rounded-lg  border border-[#3DC8FB] bg-transparent p-3 text-white focus:outline-none"
                placeholder="Enter your name..."
              />
            </div>
            <div className="">
              <label htmlFor="message" className="mb-2 block text-white">
                Message:
              </label>
              <textarea
                className="form-textarea focus:shadow-outline mt-1 block w-full appearance-none rounded border border-[#3DC8FB] bg-transparent py-2 px-3 leading-tight text-white shadow focus:outline-none"
                rows="5"
                placeholder="Enter your message"
                id="message"
                onChange={handleMessage}
                required
              ></textarea>
            </div>
          </form>
          <button
            className="btn_gradient cursor-pointer py-4 px-6 font-bold text-white"
            type="button"
            onClick={buyCoffee}
          >
            Support Me $5 ☕
          </button>
        </main>
      ) : (
        <main className="glass_effect z-50 mt-24 mb-10 flex h-[640px] w-[500px] flex-col items-center justify-evenly rounded-lg">
          <h1 className="text-2xl font-bold uppercase text-white">
            Buy Me A Coffee
          </h1>
          <div>
            <Image
              src={coffeeImg}
              alt="Coffee picture"
              width={235.16}
              height={284}
            />
          </div>
          <div
            onClick={connectWallet}
            className="btn_gradient cursor-pointer py-4 px-6 font-bold text-white"
          >
            Connect To Wallet
          </div>
        </main>
      )}

      <div className="z-10 flex flex-row flex-wrap space-x-5">
        {allCoffee
          ? allCoffee.map((coffee, index) => {
              return (
                <div
                  key={index}
                  className="relative mb-10  flex h-[300px] w-[226px] flex-col items-center justify-evenly rounded-md bg-[#10132D] p-3 shadow-lg"
                >
                  <div>
                    <svg
                      width="119"
                      height="143"
                      viewBox="0 0 119 143"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g filter="url(#filter0_b_105_120)">
                        <path
                          d="M10.5178 7.6568C11.7593 5.48343 13.5531 3.67682 15.7176 2.42C17.8822 1.16318 20.3404 0.500807 22.8434 0.5H95.7462C98.2491 0.500807 100.707 1.16318 102.872 2.42C105.036 3.67682 106.83 5.48343 108.072 7.6568L116.187 21.8568C120.788 29.9082 116.535 39.6281 108.448 42.3545C108.484 42.9367 108.476 43.5189 108.434 44.1082L102.349 129.308C102.094 132.891 100.491 136.244 97.8628 138.691C95.2345 141.139 91.7763 142.5 88.1847 142.5H30.3978C26.8062 142.5 23.348 141.139 20.7197 138.691C18.0914 136.244 16.4883 132.891 16.2333 129.308L10.1486 44.1082C10.1058 43.5246 10.0987 42.939 10.1273 42.3545C2.04749 39.6281 -2.20541 29.9082 2.38829 21.8568L10.5107 7.6568H10.5178ZM24.3202 43.1L25.8396 64.4H92.75L94.2694 43.1H24.3202ZM28.8855 107L30.4049 128.3H88.1847L89.7041 107H28.8855ZM103.861 28.9L95.7462 14.7H22.8434L14.7281 28.9H103.861Z"
                          fill="white"
                          fillOpacity="0.01"
                        />
                        <path
                          d="M3.69115 22.6001L11.3807 9.1568H11.3884L11.8203 8.4008C12.9306 6.45701 14.535 4.84124 16.4708 3.71718C18.4066 2.5932 20.605 2.00081 22.8434 2C22.8436 2 22.8437 2 22.8439 2H95.7457C95.7458 2 95.7459 2 95.7461 2C97.9845 2.00078 100.183 2.59318 102.119 3.71718C104.055 4.84124 105.659 6.45701 106.769 8.4008L106.769 8.40108L114.885 22.601C118.994 29.7928 115.204 38.4937 107.969 40.9331L106.881 41.2999L106.951 42.4458C106.982 42.9548 106.976 43.47 106.938 44L106.938 44.0013L100.853 129.201L100.853 129.202C100.625 132.406 99.1912 135.404 96.8405 137.594C94.4899 139.783 91.3969 141 88.1847 141H30.3978C27.1855 141 24.0926 139.783 21.742 137.594C19.3913 135.404 17.9576 132.406 17.7295 129.202L17.7295 129.201L11.6448 44.0013L11.6446 43.9984C11.6062 43.4758 11.5999 42.9513 11.6255 42.4279L11.681 41.2957L10.6069 40.9332C3.3788 38.4942 -0.412134 29.7936 3.69049 22.6013C3.69071 22.6009 3.69093 22.6005 3.69115 22.6001ZM24.3202 41.6H22.7094L22.824 43.2067L24.3434 64.5067L24.4428 65.9H25.8396H92.75H94.1468L94.2462 64.5067L95.7656 43.2067L95.8802 41.6H94.2694H24.3202ZM28.8855 105.5H27.2747L27.3893 107.107L28.9087 128.407L29.0081 129.8H30.4049H88.1847H89.5815L89.6809 128.407L91.2003 107.107L91.3149 105.5H89.7041H28.8855ZM103.861 30.4H106.446L105.164 28.1557L97.0485 13.9557L96.6166 13.2H95.7462H22.8434H21.973L21.5411 13.9557L13.4258 28.1557L12.1432 30.4H14.7281H103.861Z"
                          stroke="url(#paint0_linear_105_120)"
                          strokeWidth="3"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_b_105_120"
                          x="-71.5"
                          y="-71.5"
                          width="261.58"
                          height="286"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feGaussianBlur
                            in="BackgroundImage"
                            stdDeviation="36"
                          />
                          <feComposite
                            in2="SourceAlpha"
                            operator="in"
                            result="effect1_backgroundBlur_105_120"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_backgroundBlur_105_120"
                            result="shape"
                          />
                        </filter>
                        <linearGradient
                          id="paint0_linear_105_120"
                          x1="0.5"
                          y1="0.5"
                          x2="118.36"
                          y2="142.5"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#6F46D8" />
                          <stop offset="1" stopColor="#4A95D0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-white">{coffee.name}</p>
                  <p className="w-full text-center text-white">
                    {coffee.message}
                  </p>
                </div>
              )
            })
          : null}
      </div>

      <div className="fixed top-0 left-0 h-screen min-w-full">
        <div className="absolute -top-14 left-[28%] blur-[100px]">
          <svg
            width="745"
            height="255"
            viewBox="0 0 745 255"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="372.5" cy="-103" rx="372.5" ry="358" fill="#53A9E8" />
          </svg>
        </div>

        <div className="absolute -bottom-[3rem] left-[27%] blur-[100px]">
          <svg
            width="835"
            height="286"
            viewBox="0 0 835 286"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="417.5" cy="358" rx="417.5" ry="358" fill="#794CEC" />
          </svg>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

{
  /* <div className="sticky top-3 z-50 hidden w-full max-w-xs">
          <form className="mb-4 rounded bg-white px-8 pt-6 pb-8 shadow-md">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Name
              </label>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                type="text"
                id="name"
                placeholder="Enter your name"
                onChange={handleName}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Message
              </label>
              <textarea
                className="form-textarea focus:shadow-outline mt-1 block w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                rows="3"
                placeholder="Enter your message"
                id="message"
                onChange={handleMessage}
                required
              ></textarea>
            </div>
            <div className="items-left flex justify-between">
              <button
                className="focus:shadow-otline rounded bg-blue-500 py-2 px-4 text-center font-bold text-white hover:bg-blue-700 focus:outline-none"
                type="button"
                onClick={buyCoffee}
              >
                Support Me $5 ☕
              </button>
            </div>
          </form>
        </div> */
}
