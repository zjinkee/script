let url = $request.url;
let body = $response.body;

if (/(users\/(pub|login))/.test(url)) {
    let obj = JSON.parse(body);
    const expire = 2524579200000;
    
    const payInfoMod = {
        "isVip": 1,
        "isVipBoolean": true,
        "isPayVipBoolean": true,
        "isBigVipBoolean": true,
        "isBigPayVipBoolean": true,
        "isActVipBoolean": true,
        "isSignedBoolean": true,
        "isCtVipBoolean": true,
        "isCtPayVipBoolean": true,
        "isFreeCtVip": true,
        "isSigned": 1,
        "vipType": 1,
        "payVipType": 1,
        "actVipType": 1,
        "signType": 1,
        "expireDate": expire,
        "payExpireDate": expire,
        "bigExpireDate": expire,
        "actExpireDate": expire,
        "ctExpireDate": expire,
        "ctPayExpireDate": expire,
        "bigPayExpireDate": expire
    };

    const userInfoMod = {
        "isVip": 1,
        "vipType": 1,
        "payVipType": 1,
        "AuthType": 1
    };

    if (obj.data) {
        if (obj.data.payInfo) {
            Object.assign(obj.data.payInfo, payInfoMod);
        }
        if (obj.data.userInfo) {
            Object.assign(obj.data.userInfo, userInfoMod);
        }
        if (obj.data.userFreeInfo) {
            obj.data.userFreeInfo.csIsFree = 1;
        }
    }

    body = JSON.stringify(obj);
}

$done({ body });
