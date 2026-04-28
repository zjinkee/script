const inputParams = $environment.params;
const nodeName = inputParams.nodeInfo.name;

const api = {
    ipInfo:  "http://ipwho.is/?lang=zh-CN",
    ipType:  "http://my.ippure.com/v1/info"
};

const httpGet = function (url, expectStatus) {
    return new Promise(function (resolve) {
        $httpClient.get(
            { url: url, timeout: 5000, node: nodeName },
            function (err, res, data) {
                if (err || !res || (expectStatus && res.status !== expectStatus)) {
                    resolve(null);
                    return;
                }
                resolve(data);
            }
        );
    });
};

const safeParse = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
};

Promise.all([
    httpGet(api.ipInfo),
    httpGet(api.ipType)
]).then(function (results) {

    const ipRes   = results[0];
    const typeRes = results[1];

    const ipData   = safeParse(ipRes);
    const typeData = safeParse(typeRes);

    const obj = {
        ip:           ipData.ip || "-",
        country:      ipData.country || "-",
        connection: {
            isp: (ipData.connection && ipData.connection.isp) || "-"
        }
    };

    const typeInfo = {
        ipType: typeData.isResidential ? "属于家宽IP" : "属于机房IP",
        fraud:  typeData.fraudScore != null ? typeData.fraudScore : "-"
    };

    const fraudColor = typeInfo.fraud === "-"
        ? ""
        : (typeInfo.fraud >= 40 ? "#FF9500" : "#35B27B");

    const html = `
<p style="text-align:center; font-family: -apple-system; line-height:2;">
    <br>

    <span style="font-size:20px; font-weight:520; color:#1599FF; font-family:Menlo;">
    ${obj.ip || "查询失败"}
</span><br><br>

    <span style="font-size:15px; font-weight:450;">
        位置：${obj.country}
    </span><br>
		
		<span style="font-size:15px; font-weight:450;">
        运营：${obj.connection && obj.connection.isp}
    </span><br>
		
    <span style="font-size:15px; font-weight:450;">
        类型：${typeInfo.ipType}
    </span><br>
		
		<span style="font-size:15px; font-weight:450;">
        风险：<span style="color:${fraudColor};">${typeInfo.fraud}%</span>
    </span><br><br>
    
    <span style="font-size:15px; font-weight:450;">
        策略节点 ➞ ${nodeName}
    </span>
</p>`;

    $done({
        title: "IP信息",
        htmlMessage: html
    });
});
