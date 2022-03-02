//import './App.css'
import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import FormData from 'form-data';
import axios from 'axios';
import myMusicNft from './utils/MyMusicNFT.json';
//import {writeJsonFile} from 'write-json-file'; 

const CONTRACT_ADDRESS = "0xE174886656fE5a8bd2308d1471d67aADAF5A2A92";

function App() {

  const [file, setFile] = useState()
  const [myAnimationHash, setAnimationHASH] = useState('')
  const [myCoverHash, setCoverHASH] = useState('')
  const [myipfsHash, setIPFSHASH] = useState('')
  const [currentAccount, setCurrentAccount] = useState("");
  const [myName, setName] = useState("");
  const [myUri, setUri] = useState("");

  const [song_name, setSongName] = useState("")
  const [description, setDescription] = useState("")
  const [external_link, setExternalLink] = useState("")
  const [artist, setArtist] = useState("")
  const [license, setLicense] = useState("")
  const [label, setLabel] = useState("")


  const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          
          // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()
      } else {
          console.log("No authorized account found")
      }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myMusicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewMusicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myMusicNft.abi, signer);
        const uri = myUri;

        console.log("Going to pop wallet now to pay gas...")
        console.log(uri)
        let nftTxn = await connectedContract.makeMusicNFT(uri);

        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )
  const handleArtist=async (artist) => {
    setArtist(artist)
  }
  const handleCover=async (fileToHandle) =>{

    
    console.log(artist)
    console.log('starting')

    // initialize the form data
    const formData = new FormData()

    // append the file form data to 
    formData.append("file", fileToHandle)

    // call the keys from .env

    const API_KEY = process.env.REACT_APP_API_KEY
    const API_SECRET = process.env.REACT_APP_API_SECRET

    // the endpoint needed to upload the file
    const url =  `https://api.pinata.cloud/pinning/pinFileToIPFS`

    const response = await axios.post(
      url,
      formData,
      {
          maxContentLength: "Infinity",
          headers: {
              "Content-Type": `multipart/form-data;boundary=${formData._boundary}`, 
              'pinata_api_key': API_KEY,
              'pinata_secret_api_key': API_SECRET

          }
      }
  )

  console.log(response)

  // get the hash
  setCoverHASH(response.data.IpfsHash)

  
  }

  const pinJSON = async () => {
    console.log("Starting")

    // initialize the form data
    const formData = {
                "name": song_name,
                "description": description,
                "image": "ipfs://" + myCoverHash,
                "animation_url": "ipfs://" + myAnimationHash,
                "external_url": external_link,
                "attributes": {
                    "artist" : artist,
                     "license": license,
                     "label": label
                }
      }

    // append the file form data to 
    //formData.append("name", 'AI')
    //formData.append("description", 'AI')
    //formData.append("image", myCoverHash)
    //formData.append("animation_url", myAnimationHash)
    //formData.append("external_url", 'https://soundcloud.com/phallumdubz')
    //formData.append("attributes", {"artist": "BN", "license": "BN", "label": "AI"})
    console.log(formData)


    // call the keys from .env

    const API_KEY = process.env.REACT_APP_API_KEY
    const API_SECRET = process.env.REACT_APP_API_SECRET

    // the endpoint needed to upload the file
    const url =  `https://api.pinata.cloud/pinning/pinJSONToIPFS`

    const response = await axios.post(
      url,
      formData,
      {
          //maxContentLength: "Infinity",
          headers: {
              //"Content-Type": `multipart/form-data;boundary=${formData._boundary}`, 
              'pinata_api_key': API_KEY,
              'pinata_secret_api_key': API_SECRET

          }
      }
  )

   console.log(response)
   setUri(response.data.IpfsHash) 
  }

  const handleAnimation=async (fileToHandle) =>{

    
    //writeJsonFile('foo.json', {foo: true});
    console.log('starting')

    // initialize the form data
    const formData = new FormData()

    // append the file form data to 
    formData.append("file", fileToHandle)

    // call the keys from .env

    const API_KEY = process.env.REACT_APP_API_KEY
    const API_SECRET = process.env.REACT_APP_API_SECRET

    // the endpoint needed to upload the file
    const url =  `https://api.pinata.cloud/pinning/pinFileToIPFS`

    const response = await axios.post(
      url,
      formData,
      {
          maxContentLength: "Infinity",
          headers: {
              "Content-Type": `multipart/form-data;boundary=${formData._boundary}`, 
              'pinata_api_key': API_KEY,
              'pinata_secret_api_key': API_SECRET

          }
      }
  )

  console.log(response)

  // get the hash
  setAnimationHASH(response.data.IpfsHash)

  
  }

    return (
    <div className="App">
     <form>
      <label>Artist Name:
        <input
          type="text" 
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </label>
    </form>
     <form>
      <label>Song Name:
        <input
          type="text" 
          value={song_name}
          onChange={(e) => setSongName(e.target.value)}
        />
      </label>
    </form> 
       <label>NFT Description:
        </label>
     <textarea
      
          value={description}
          onChange={(e) => setDescription(e.target.value)}
       >
     
    </textarea>

    <form>
      <label>External Link:
        <input
          type="text" 
          value={external_link}
          onChange={(e) => setExternalLink(e.target.value)}
        />
      </label>
    </form>
     <form>
      <label>Label:
        <input
          type="text" 
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </label>
    </form>
    <form>
      <label>License:
        <input
          type="text" 
          value={license}
          onChange={(e) => setLicense(e.target.value)}
        />
      </label>
    </form>
     <div className="container">
       <label> Upload Cover Art :
      <input className="cta-button connect-wallet-button" type="file" onChange={(event)=>setFile(event.target.files[0])}/>
      </label>
      {

      //  render the hash
      myCoverHash.length > 0 && <img height='200' src={`https://gateway.pinata.cloud/ipfs/${myCoverHash}`} alt='not loading'/>
      }
      </div>
      <button className="cta-button connect-wallet-button" onClick={()=>handleCover(file)}>Pin Cover</button>
      <div className="container">
        <label> Upload Music/Video file:
       <input type="file" onChange={(event)=>setFile(event.target.files[0])}/>
       </label>
            {

      //  render the hash
      myAnimationHash.length > 0 && <label> Success!</label>
      }
      </div>
      <button className="cta-button connect-wallet-button" onClick={()=>handleAnimation(file)}>Pin Animation</button>
       <button className="cta-button connect-wallet-button" onClick={()=>pinJSON()}>Pin JSON</button>
       {

      //  render the hash
      myUri.length > 0 && <label> Success!</label>
      }       
       <div className="container">

          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
      </div>
    </div>

  );
};
export default App;
