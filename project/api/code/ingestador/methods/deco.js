/* Recursos adicionales */

const configMethods = [
  {
    type: 'JUMP1',
    method: jump,
    bytes: 1
  },
  {
    type: 'JUMP2',
    method: jump,
    bytes: 2
  },
  {
    type: 'JUMP3',
    method: jump,
    bytes: 3
  },
  {
    type: 'JUMP4',
    method: jump,
    bytes: 4
  },
  {
    type: 'UINT8',
    method: bytesToInt,
    bytes: 1
  },
  {
    type: 'UINT16',
    method: bytesToInt,
    bytes: 2
  },
  {
    type: 'UINT24',
    method: bytesToInt,
    bytes: 3
  },
  {
    type: 'UINT32',
    method: bytesToInt,
    bytes: 4
  },
  {
    type: 'FLOAT16',
    method: float16,
    bytes: 2
  },
  {
    type: 'FLOAT32',
    method: float32,
    bytes: 4
  },
  {
    type: 'BATERY_DRAGINO',
    method: draginoBat,
    bytes: 2
  },
  {
    type: 'TEMPERATURE_DRAGINO',
    method: draginoTemp,
    bytes: 2
  },
  {
    type: 'CONDUCTSOIL_DRAGINO',
    method: draginoConductSoil,
    bytes: 2
  },
  {
    type: 'TEMPETURESOIL_DRAGINO',
    method: draginoTempSoil,
    bytes: 2
  },
  {
    type: 'WATERSOIL_DRAGINO',
    method: draginoWaterSoil,
    bytes: 2
  },
  {
    type: 'INT8_ENLESS',
    method: intEnless,
    bytes: 1
  },
  {
    type: 'INT16_ENLESS',
    method: intEnless,
    bytes: 2
  },
  {
    type: 'INT24_ENLESS',
    method: intEnless,
    bytes: 3
  },
  {
    type: 'UINT8_ENLESS',
    method: uintEnless,
    bytes: 1
  },
  {
    type: 'UINT16_ENLESS',
    method: uintEnless,
    bytes: 2
  },
  {
    type: 'UINT24_ENLESS',
    method: uintEnless,
    bytes: 3
  },
  {
    type: 'UINT8D1_ENLESS',
    method: uintEnlessD1,
    bytes: 1
  },
  {
    type: 'UINT16D1_ENLESS',
    method: uintEnlessD1,
    bytes: 2
  },
  {
    type: 'UINT24D1_ENLESS',
    method: uintEnlessD1,
    bytes: 3
  },
  {
    type: 'BATERY_ENLESS',
    method: bateryEnless,
    bytes: 2
  }
]

//--------------------------------------------------------------------------------------

function typeExist(estructuraBuscada) {
  let index = configMethods.find(index => index.type === estructuraBuscada);
  if (index) return true
  return false;
}

function methodType(estructuraBuscada) {
  let index = configMethods.find(index => index.type === estructuraBuscada);
  return index.method;
}

function methodBytes(estructuraBuscada) {
  let index = configMethods.find(index => index.type === estructuraBuscada);
  return index.bytes;
}

//------------- FUNCIONES DECO DE ENLESS

// CONSTANTES
const ENLESS_INT_MIN = -parseInt("0xFFFF");
const ENLESS_INT_MAX = parseInt("0xFFFF");

// GENERAL PARA TRABAJAR CON BYTES EN HEXADECIMAL
function bytesToHex(bytes) {
  if (!bytes || bytes.length <= 0) return '00';
  // pasamos los bytes a exadecimal y los encadenamos
  let hex = '';
  for (i = 0; i < bytes.length; i++) {
    cad = Number(bytes[i]).toString(16).padStart(2, '0');
    hex += cad;
  }
  return hex;
}

function hexToBin(hex, numOfBytes = 2) {
  return parseInt(hex, 16)
    .toString(2)
    .padStart(numOfBytes * 4, "0");
};

function bateryEnless(bytes) {
  hex = bytesToHex(bytes);

  const binNum = hexToBin(hex, 4);
  let startBit = 4;
  let endBit = 2;
  const batteryCode = binNum.substring(binNum.length - startBit, binNum.length - endBit);
  switch (batteryCode) {
    case "00":
      return 100;
    case "01":
      return 75;
    case "10":
      return 50;
    case "11":
      return 25;
    default:
      return -1;
  }
}


function intEnless(bytes, divisor = 10) {
  hex = bytesToHex(bytes);

  const upperHex = hex.toUpperCase();
  let valor = 0;
  if (upperHex >= "8000" && upperHex <= "FFFF") {
    valor = (parseInt(hex, 16) - ENLESS_INT_MAX - 1) / 10;
  } else {
    valor = parseInt(hex, 16) / divisor;
  }
  return valor
}

function uintEnless(bytes, divisor = 10) {
  hex = bytesToHex(bytes);
  return parseInt(hex, 16) / divisor;
}

function uintEnlessD1(bytes) {
  return uintEnless(bytes, 1)
}



//------------------------

function jump(bytes) {
  return -1
}


//--------------------------------------------------------------------------------------

function bytesToInt(bytes) {
  var i = 0;
  for (var x = 0; x < bytes.length; x++) {
    i |= +(bytes[x] << (x * 8));
  }
  return i;
};

function float16(bytes) {
  if (bytes.length !== 2) {
    throw new Error('Float must have exactly 2 bytes');
  }
  bytesArray = []
  bytesArray.push(bytes[0])
  bytesArray.push(bytes[1])

  let bits = bytesArray[1] | bytesArray[0] << 8;

  let sign = (bits & 0x8000) == 0 ? 1.0 : -1.0;

  let e = bits >>> 10 & 0x1f;

  let m = (e === 0) ? (bits & 0x03ff) | 0x400 : (bits & 0x03ff); //true : false

  var f = 0;

  if (e == 0) { //0
    f = sign * Math.pow(2, - 14) * (m / 1024);
  } else {
    f = sign * Math.pow(2, e - 15) * (1 + m / 1024);
  }

  return f;

}

function float32(bytes) {
  if (bytes.length !== 4) {
    throw new Error('Float must have exactly 4 bytes');
  }
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits >>> 23 & 0xff;
  var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

//--------------------------------------------------------------------------------------

function draginoBat(bytes) { // 0,1
  if (bytes.length !== 2) {
    throw new Error('Error porque dragino Bat necestio 2 bytes');
  }
  var f = (bytes[0] << 8 | bytes[1]) & 0x3FFF;
  return f;
}


function draginoTemp(bytes) { // 2,3
  if (bytes.length !== 2) {
    throw new Error('Error porque dragino Bat necestio 2 bytes');
  }
  value = bytes[0] << 8 | bytes[1]; //bytes[2] << 8 
  if (bytes[0] & 0x80) { value |= 0xFFFF0000; } //bytes[2] & 0x80
  f = (value / 10).toFixed(1);

  return f;
}

function draginoWaterSoil(bytes) { // 4,5
  if (bytes.length !== 2) {
    throw new Error('Error porque dragino Bat necestio 2 bytes');
  }
  value = bytes[0] << 8 | bytes[1];
  f = (value / 100).toFixed(2);//water_SOIL,Humidity,units:%

  return f;
}

function draginoTempSoil(bytes) { // 6,7
  if (bytes.length !== 2) {
    throw new Error('Error porque dragino Bat necestio 2 bytes');
  }
  value = bytes[0] << 8 | bytes[1];
  if ((value & 0x8000) >> 15 === 0)
    f = (value / 100).toFixed(2);//temp_SOIL,temperature,units:°C

  else if ((value & 0x8000) >> 15 === 1)
    f = ((value - 0xFFFF) / 100).toFixed(2);//temp_SOIL,temperature,units:°C

  return f;
}

function draginoConductSoil(bytes) { // 8,9
  if (bytes.length !== 2) {
    throw new Error('Error porque dragino Bat necestio 2 bytes');
  }
  value = bytes[8] << 8 | bytes[9];
  f = (value);//conduct_SOIL,conductivity,units:uS/cm

  return f;
}

//--------------------------------------------------------------------------------------
function decode(bytes, mask, maskLength) {

  let totalMasklenght = 0;
  for (let i = 0; i < maskLength.length; i++) {
    totalMasklenght += maskLength[i];
  }
  // let maskLength = mask.reduce(function(prev, cur) {
  //   return prev + cur.BYTES;
  // }, 0);
  if (bytes.length < totalMasklenght) {
    return [];
    throw new Error('Mask length is ' + totalMasklenght + ' whereas input is ' + bytes.length);
  }

  names = [];
  let offset = 0;
  let index = 0;
  // let resultado = [];

  // for (let i=0; i<mask.length; i++) {
  //     let sendBytes = bytes.slice(offset, offset += maskLength[i]);
  //     mask[i](sendBytes)
  // }

  return mask
    .map(function (decodeFn) {
      let current = bytes.slice(offset, offset += maskLength[index]);
      index += 1;
      return decodeFn(current);
    })
    .reduce(function (prev, cur, idx) {
      prev[names[idx] || idx] = cur;
      return prev;
    }, {});

};





module.exports = { typeExist, methodType, methodBytes, decode };


