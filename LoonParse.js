const Loon_Type=$resourceType;
const Loon_Key="loon_parser_lite_"+encodeURIComponent(typeof $resourceUrl!="undefined"&&$resourceUrl?String($resourceUrl):"default_parser");

let Loon={name:"",del:"",keep:"",emoji:""};

function notify(msg){
    $notification.post("Loon解析器","",msg);
}

const Loon_Saved=$persistentStore.read(Loon_Key);

if(!Loon_Saved){
    notify("没有本地持久化参数");
}else{
    const c=JSON.parse(Loon_Saved);
    Loon.name=c.name||c.n||"";
    Loon.del=c.del||c.d||"";
    Loon.keep=c.keep||c.k||"";
    Loon.emoji=c.emoji||"";
}

const Loon_Argument=typeof $argument!="undefined"?$argument.toString():"";

if(Loon_Argument&&!Loon_Argument.startsWith("http")){
    let update=false;

    Loon_Argument.split("&").forEach(i=>{
        let [k,...v]=i.split("=");
        let key=k.trim().toLowerCase();
        let val=decodeURIComponent(v.join("=")).trim();

        if(!["name","del","keep","emoji"].includes(key)){
            return;
        }

        if(key=="name"){
            Loon.name=val;
            update=true;
        }

        if(key=="del"){
            Loon.del=val;
            update=true;
        }

        if(key=="keep"){
            Loon.keep=val;
            update=true;
        }

        if(key=="emoji"){
            if(val==="0"||val==="1"){
                Loon.emoji=val;
                update=true;
            }
        }
    });

    if(update){
        $persistentStore.write(JSON.stringify(Loon),Loon_Key);
    }
}

const Loon_Utils={
    isRegex(p){
        return /[\[\]\(\)\*\+\?\.\\\^\$\|]/.test(p);
    },
    match(t,p){
        if(!t||!p)return false;
        p=p.trim();
        try{
            if(this.isRegex(p)){
                return new RegExp(p,"i").test(t);
            }
        }catch{}
        return t.toLowerCase().includes(p.toLowerCase());
    },
    replace(t,p,s){
        if(!p||t===undefined)return t;
        p=p.trim();
        try{
            if(this.isRegex(p)){
                return t.replace(new RegExp(p,"gi"),s);
            }
        }catch{}
        return t.split(p).join(s);
    },
    stripEmoji(t){
        return t.replace(/[\uD83C-\uD83E][\uDC00-\uDFFF]/g,"").replace(/[\u200D\uFE0F]/g,"").trim();
    },
    getFlag(t){
        const m={
            香港:"HK",
            台湾:"TW",
            日本:"JP",
            新加坡:"SG",
            韩国:"KR",
            美国:"US",
            德国:"DE",
            英国:"GB",
            法国:"FR",
            澳门:"MO",
            加拿大:"CA",
            澳大利亚:"AU",
            印度:"IN",
            俄罗斯:"RU",
            荷兰:"NL",
            意大利:"IT",
            西班牙:"ES",
            瑞士:"CH",
            瑞典:"SE",
            挪威:"NO",
            丹麦:"DK",
            芬兰:"FI",
            土耳其:"TR",
            泰国:"TH",
            越南:"VN",
            马来西亚:"MY",
            印度尼西亚:"ID",
            菲律宾:"PH",
            巴西:"BR",
            南非:"ZA",
            阿联酋:"AE"
        };

        let u=t.toUpperCase(),c="";

        for(let k in m){
            if(u.includes(k)){
                c=m[k];
                break;
            }
        }

        if(!c){
            let r=u.match(/\b(HK|TW|JP|SG|KR|US|DE|GB|FR|MO|CA|AU|IN|RU|NL|IT|ES|CH|SE|NO|DK|FI|TR|TH|VN|MY|ID|PH|BR|ZA|AE)\b/);
            if(r)c=r[1];
        }

        return c?String.fromCodePoint(...[...c].map(e=>e.charCodeAt(0)+127397)):"";
    }
};

function Loon_Main(){
    const res=typeof $resource!="undefined"?$resource:"";
    if(Loon_Type!==1||!res)return res;

    const rules=Loon.name?Loon.name.split("+").filter(Boolean):[];
    const dels=Loon.del?Loon.del.split("+").filter(Boolean):[];
    const keeps=Loon.keep?Loon.keep.split("+").filter(Boolean):[];

    const set=["udp=true","block-quic=true","fast-open=true"];

    return res.replace(/\r\n/g,"\n").split("\n").map(l=>{
        const c=l.trim();
        if(!c||c.startsWith("#")||!c.includes("="))return c;

        let i=c.indexOf("="),
            n=c.slice(0,i).trim(),
            v=c.slice(i+1).trim();

        if(keeps.length>0&&!keeps.some(p=>Loon_Utils.match(n,p))){
            return null;
        }

        dels.forEach(p=>{
            n=Loon_Utils.replace(n,p,"");
        });

        rules.forEach(p=>{
            let [o,nv=""]=p.split(">").map(s=>s.trim());
            if(!o)return;
            n=Loon_Utils.replace(n,o,nv);
        });

        if(Loon.emoji==="1"){
            let clean=Loon_Utils.stripEmoji(n);
            let flag=Loon_Utils.getFlag(clean);
            n=flag?flag+clean:clean;
        }else if(Loon.emoji==="0"){
            n=Loon_Utils.stripEmoji(n);
        }

        n=n.replace(/\s+/g," ").trim();

        set.forEach(kv=>{
            let key=kv.split("=")[0];
            let arr=v.split(",").map(s=>s.trim());
            let idx=arr.findIndex(s=>s.startsWith(key+"="));
            if(idx>-1)arr[idx]=kv;
            else arr.push(kv);
            v=arr.join(", ");
        });

        return `${n}=${v}`;
    }).filter(i=>i!==null).join("\n");
}

$done(Loon_Main());
