/*
README:https://github.com/VirgilClyne/GetSomeFries
*/

const $ = new Env('Cloudflare 1.1.1.1 with WARP');


// BoxJs Function Supported
if (typeof $.getdata("GetSomeFries") != "undefined") {
	// load user prefs from BoxJs
	$.Cloudflare = JSON.parse($.getdata("GetSomeFries")).Cloudflare
	$.WireGuard = JSON.parse($.getdata("GetSomeFries")).WireGuard
	//$.log(JSON.stringify($.Cloudflare.WARP))
	if ($.Cloudflare.WARP.Verify.Mode == "Key") {
		$.Cloudflare.WARP.Verify.Content = Array.from($.Cloudflare.WARP.Verify.Content.split("\n"))
		//$.log(JSON.stringify($.Cloudflare.WARP.Verify.Content))
	};
	// Argument Function Supported
} else if (typeof $argument != "undefined") {
	let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
	$.log(JSON.stringify(arg));
	$.Cloudflare.WARP.Verify.License = arg.License;
	$.Cloudflare.WARP.Verify.Mode = arg.Mode;
	$.Cloudflare.WARP.Verify.Content = arg.AccessToken;
	$.Cloudflare.WARP.Verify.Content = arg.ServiceKey;
	$.Cloudflare.WARP.Verify.Content[0] = arg.Key;
	$.Cloudflare.WARP.Verify.Content[1] = arg.Email;
	$.Cloudflare.WARP.Verify.RegistrationId = arg.RegistrationId;
	$.WireGuard.PrivateKey = arg.PrivateKey;
	$.WireGuard.PublicKey = arg.PublicKey;
	$.Cloudflare.WARP.env.Version = arg.Version;
	$.Cloudflare.WARP.env.deviceType = arg.deviceType;
} else {
	$.Cloudflare.WARP = {
		"Verify": {
			"License": null,
			"Mode": "Token",
			// Requests
			// https://api.cloudflare.com/#getting-started-requests
			"Content": null,
			// API Tokens
			// API Tokens provide a new way to authenticate with the Cloudflare API.
			//"Content":"8M7wS6hCpXVc-DoRnPPY_UCWPgy8aea4Wy6kCe5T"
			"RegistrationId": null
		},
		"env": {
			"Version": "v0i2109031904",
			"deviceType": "iOS",
			"Type": "i"
		}
	}
};
console.log($.Cloudflare.WARP)

const url = $request.url;
const headers = $request.headers;
//if (typeof $request.body != "undefined") var body = $request.body
//if (typeof $response.body != "undefined") var body = $response.body

const path1 = `/reg/${$.Cloudflare.WARP.Verify.RegistrationId}`;
const path2 = "/reg/";


//Check Key and Rewrite
if (url.search(path1) != -1 && $request.method == "PUT") {
	$.log(path1);
	if (typeof $request?.body != "undefined") {
		var body = $request.body
		_data = JSON.parse(body)
		if (_data.key) {
			_data.key = $.WireGuard.PublicKey;
			$.msg($.name, "客户端公钥已替换", `当前公钥为:\n${$.WireGuard.PublicKey}`);
			//$.log($.name, "客户端公钥已替换", `当前公钥为: ${$.WireGuard.PublicKey}`, '');
		}
		body = JSON.stringify(_data);
		$.done({ body });
	}
} 

//Check Config
else if (url.search(path2) != -1 && $request.method == "GET") {
	$.log(path2);
	if (typeof $response?.body != "undefined") {
		var body = $response.body
		_data = JSON.parse(body)
		if (Array.isArray(_data.messages) && _data.messages.length != 0) _data.messages.forEach(element => {
			if (element.code !== 10000) $.msg($.name, `code: ${element.code}`, `message: ${element.message}`);
		})
		if (_data.success === true) {
			if (_data.ip) resolve(_data.ip);
			else if (Array.isArray(_data.result) && _data.result.length != 0) resolve(_data.result[0]);
			else if (_data.result) {
				var matchTokenReg = /Bearer (\S*)/
				let Token = headers['Authorization'].match(matchTokenReg)[1]
				if (_data.result.id.startsWith('t.')) {					
					$.msg($.name, "检测到WARP Teams配置文件", `设备注册ID:\n${_data.result.id}\n设备令牌Token:\n${Token}\n账户类型:${_data.result.account.account_type}\n账户组织:${_data.result.account.organization}\n客户端公钥:\n${_data.result.key}\n节点公钥:\n${_data.result.config.peers[0].public_key}`);
					//$.log($.name, "检测到WARP Teams配置文件", `设备注册ID/id: ${_data.result.id}`, `设备令牌Token: ${Token}`, `账户ID/account.id: ${_data.result.account.id}`, `账户类型/account.account_type: ${_data.result.account.account_type}`, `账户组织/account.organization: ${_data.result.account.organization}`, `客户端公钥/key: ${_data.result.key}`, `节点公钥/config.peers[0].public_key: ${_data.result.config.peers[0].public_key}`, '', `原始配置文件:\n${JSON.stringify(_data.result)}`);
					$.log($.name, "检测到WARP Teams配置文件", `原始配置文件:\n注意！文本内容未转义！字符串中可能包含额外字符！\n${JSON.stringify(_data.result)}`, '');

				} else {
					$.msg($.name, "检测到WARP Personal配置文件", `设备注册ID:\n${_data.result.id}\n设备令牌Token:\n${Token}\nWARP启用状态: ${_data.result.warp_enabled},账户类型:${_data.result.account.account_type},WARP+:${_data.result.account.warp_plus},WARP+流量:${_data.result.account.premium_data},邀请人数:${_data.result.account.referral_count}\n许可证/account.license:\n${_data.result.account.license}\n客户端公钥:\n${_data.result.key}\n节点公钥:\n${_data.result.config.peers[0].public_key}`);
					//$.log($.name, "检测到WARP Personal配置文件", `设备注册ID/id: ${_data.result.id}`, `设备令牌Token: ${Token}`, `WARP启用状态/warp_enabled: ${_data.result.warp_enabled}`, `账户ID/account.id: ${_data.result.account.id}`, `许可证/account.license: ${_data.result.account.license}`, `账户类型/account.account_type: ${_data.result.account.account_type}`, `WARP+/account.warp_plus: ${_data.result.account.warp_plus}`, `WARP+流量/account.premium_data: ${_data.result.account.premium_data}`, `邀请人数/account.referral_count: ${_data.result.account.referral_count}`, `客户端公钥/key: ${_data.result.key}`, `节点公钥/config.peers[0].public_key: ${_data.result.config.peers[0].public_key}`, '', `原始配置文件:\n${JSON.stringify(_data.result)}`);
					$.log($.name, "检测到WARP Personal配置文件", `原始配置文件:\n注意！文本内容未转义！字符串中可能包含额外字符！\n${JSON.stringify(_data.result)}`, '');

				}
			}
		} else if (_data.success === false) {
			if (Array.isArray(_data.errors) && _data.errors.length != 0) _data.errors.forEach(element => { $.msg($.name, `code: ${element.code}`, `message: ${element.message}`); })
		}
	}
	$.done();
}
else $.done();

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=rawOpts["update-pasteboard"]||rawOpts.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
