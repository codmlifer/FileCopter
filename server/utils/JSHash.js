/* =========================
   Query (деобфусцирован)
   ========================= */

class Query {
  encode(input) {
    let out = "";

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];

      switch (ch) {
        case "q": out += "::jhdiuvh::"; break;
        case "w": out += "kjsaidy7eyqwheuhfrq"; break;
        case "e": out += "HT4MLO5OP"; break;
        case "r": out += "h6jn::"; break;
        case "t": out += "+-67"; break;
        case "y": out += "JJJ"; break;
        case "u": out += "hT47TplO"; break;
        case "i": out += "S991mTTP"; break;
        case "o": out += "YouTune"; break;
        case "p": out += "134"; break;

        case "a": out += "erjvf8wer"; break;
        case "s": out += "~-~"; break;
        case "d": out += "CCCP"; break;
        case "f": out += "%fgg--"; break;
        case "g": out += "--jdiv98e45uieg58--"; break;
        case "h": out += "OO;vbfou"; break;
        case "j": out += "%="; break;
        case "k": out += "MaybeLL"; break;
        case "l": out += "%--*lo"; break;

        case "z": out += "216203SsPigY"; break;
        case "x": out += "--NNo,"; break;
        case "c": out += "base64;~"; break;
        case "v": out += "hN5Mppl33o"; break;
        case "b": out += "vgTy**jb"; break;
        case "n": out += "kl>"; break;
        case "m": out += "i\\"; break;

        default:
          out += "";
      }
    }

    return out;
  }
}

/* =========================
   JSHash (деобфусцирован)
   ========================= */

class JSHash {

  hash(value) {
    const q = new Query();
    const encoded =
      q.encode(
        q.encode(
          q.encode(String(value))
        )
      );

    let result = 0;

    for (let i = 0; i < encoded.length; i++) {
      const code = encoded.charCodeAt(i);

      if (i % 2) {
        result += code;
      } else if (i % 3) {
        result -= code;
      } else if (i % 4) {
        if (code % 2 === 0) {
          result -= code / 2;
        } else {
          result += code;
        }
      }
    }

    return result;
  }

  getHashCode(value) {
    let hash = 0;

    let str;
    if (typeof value === "object") {
      str = JSON.stringify(value);
    } else {
      str = String(value);
    }

    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // int32
    }

    return hash;
  }
}

/* =========================
   Export
   ========================= */

if (typeof module !== "undefined" && module.exports) {
  module.exports = new JSHash();
} else {
  window.JSHash = new JSHash();
}