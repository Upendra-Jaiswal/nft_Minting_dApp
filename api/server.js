const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
});

const starton = axios.create({
  baseURL: "https://api.starton.io/v3",
  headers: {
    "x-api-key": "sk_live_6c98a29c-799c-4f3d-8039-07126c2d29b4",
  },
});

app.post("/upload", cors(), upload.single("file"), async (req, res) => {
  let data = new FormData();
  const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
  data.append("file", blob, { filename: req.file.originalnam });
  data.append("isSync", "true");

  async function uploadImageOnIpfs() {
    const ipfsImg = await starton.post("/ipfs/file", data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      },
    });
    return ipfsImg.data;
  }
  async function uploadMetadataOnIpfs(imgCid) {
    const metadataJson = {
      name: `A Wonderful NFT`,
      description: `Probably the most awesome NFT ever created !`,
      image: `ipfs://ipfs/${imgCid}`,
    };
    const ipfsMetadata = await starton.post("/ipfs/json", {
      name: "My NFT metadata Json",
      content: metadataJson,
      isSync: true,
    });
    return ipfsMetadata.data;
  }

  const SMART_CONTRACT_NETWORK = "polygon-mumbai";
  const SMART_CONTRACT_ADDRESS = "0xc2901abD0194dba13B1Fe37f96212C24C22A06d3";
  const WALLET_IMPORTED_ON_STARTON =
    "0x3313a6faaaE4BD2dbdcDa9857992207F50F0D700";
  async function mintNFT(receiverAddress, metadataCid) {
    const nft = await starton.post(
      `/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`,
      {
        functionName: "mint",
        signerWallet: WALLET_IMPORTED_ON_STARTON,
        speed: "low",
        params: [receiverAddress, metadataCid],
      }
    );
    return nft.data;
  }
  const RECEIVER_ADDRESS = "0xe510F26bF805d530F7bE32743234C80893ba7BD9";
  const ipfsImgData = await uploadImageOnIpfs();
  const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
  const nft = await mintNFT(RECEIVER_ADDRESS, ipfsMetadata.cid);
  console.log(nft);
  res.status(201).json({
    transactionHash: nft.transactionHash,
    cid: ipfsImgData.cid,
  });
});
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const axios = require("axios");
// const app = express();
// const port = process.env.PORT || 5000;

// app.use(express.json());

// const upload = multer({
//   limits: {
//     fileSize: 1000000,
//   },
// });

// const starton = axios.create({
//   baseURL: "https://api.starton.io/v3",
//   headers: {
//     "x-api-key": "sk_live_6c98a29c-799c-4f3d-8039-07126c2d29b4",
//   },
// });

// app.post("/upload", cors(), upload.single("file"), async (req, res) => {
//   let data = new FormData();
//   const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
//   data.append("file", blob, { filename: req.file.originalnam });
//   data.append("isSync", "true");

//   async function uploadImageOnIpfs() {
//     const ipfsImg = await starton.post("/ipfs/file", data, {
//       headers: {
//         "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
//       },
//     });
//     return ipfsImg.data;
//   }
//   async function uploadMetadataOnIpfs(imgCid) {
//     const metadataJson = {
//       name: `A Wonderful NFT`,
//       description: `Probably the most awesome NFT ever created !`,
//       image: `ipfs://ipfs/${imgCid}`,
//     };
//     const ipfsMetadata = await starton.post("/ipfs/json", {
//       name: "My NFT metadata Json",
//       content: metadataJson,
//       isSync: true,
//     });
//     return ipfsMetadata.data;
//   }

//   const SMART_CONTRACT_NETWORK = "polygon-mumbai";
//   const SMART_CONTRACT_ADDRESS = "0xc2901abD0194dba13B1Fe37f96212C24C22A06d3";
//   const WALLET_IMPORTED_ON_STARTON =
//     "0x3313a6faaaE4BD2dbdcDa9857992207F50F0D700";
//   async function mintNFT(receiverAddress, metadataCid) {
//     const nft = await starton.post(
//       `/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`,
//       {
//         functionName: "mint",
//         signerWallet: WALLET_IMPORTED_ON_STARTON,
//         speed: "low",
//         params: [receiverAddress, metadataCid],
//       }
//     );
//     return nft.data;
//   }
//   const RECEIVER_ADDRESS = "0xe510F26bF805d530F7bE32743234C80893ba7BD9";
//   const ipfsImgData = await uploadImageOnIpfs();
//   const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
//   const nft = await mintNFT(RECEIVER_ADDRESS, ipfsMetadata.cid);
//   console.log(nft);
//   res.status(201).json({
//     transactionHash: nft.transactionHash,
//     cid: ipfsImgData.cid,
//   });
// });
// app.listen(port, () => {
//   console.log("Server is running on port " + port);
// });

// // var createError = require('http-errors');
// // var express = require('express');
// // var path = require('path');
// // var cookieParser = require('cookie-parser');
// // var logger = require('morgan');

// // var indexRouter = require('./routes/index');
// // var usersRouter = require('./routes/users');

// // var app = express();

// // // view engine setup
// // app.set('views', path.join(__dirname, 'views'));
// // app.set('view engine', 'jade');

// // app.use(logger('dev'));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: false }));
// // app.use(cookieParser());
// // app.use(express.static(path.join(__dirname, 'public')));

// // app.use('/', indexRouter);
// // app.use('/users', usersRouter);

// // // catch 404 and forward to error handler
// // app.use(function(req, res, next) {
// //   next(createError(404));
// // });

// // // error handler
// // app.use(function(err, req, res, next) {
// //   // set locals, only providing error in development
// //   res.locals.message = err.message;
// //   res.locals.error = req.app.get('env') === 'development' ? err : {};

// //   // render the error page
// //   res.status(err.status || 500);
// //   res.render('error');
// // });

// // module.exports = app;

////  // "start": "node ./bin/www"
// "start": "node ./app"
