let url = $request.url;
let body = $response.body;

if (/v6\/main\/init/.test(url)) {
    let obj = JSON.parse(body);

    if (obj.data) {
        obj.data = obj.data.filter(item => item.entityId !== 24455);

        obj.data.forEach(item => {
            if (item.extraDataArr) {
                for (let k in item.extraDataArr) {
                    if (/Ad|Splash|GROWTH|redPacket/i.test(k)) {
                        item.extraDataArr[k] = "0";
                    }
                    if (/HttpDns|HttpDnsServer/i.test(k)) {
                        item.extraDataArr[k] = "";
                    }
                }
            }

            let ID = [];
            if (item.entityId === 6390) ID = [420, 2759, 415, 417, 1229];
            if (item.entityId === 20305) ID = [790, 813, 2258, 2894, 2191];
            if (item.entityId === 20131) ID = [2953, 1175, 2892, 2893, 2018];

            if (ID.length > 0 && item.entities) {
                let arr = [];
                ID.forEach(id => {
                    item.entities.forEach(e => {
                        if (e.entityId === id) arr.push(e);
                    });
                });
                item.entities = arr;
            }
        });
    }

    body = JSON.stringify(obj);
}

$done({ body });
