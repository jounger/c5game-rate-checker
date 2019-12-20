var items_steam = [];
var appid = null;
getGame();

function getGame(){
	var pathname = window.location.pathname;
	if (pathname.includes('csgo')) {
		appid = 730; // csgo appid
	} else if (pathname.includes('dota')) {
		appid = 570; // dota2 appid
	} else {
		appid = null;
	}
	if(appid != null) {
		reRenderPage();
		items_steam = getDataFromLocal(appid);
	}
	function reRenderPage() {
		const instant = $('.selling');
		$.each(instant, function (index, item) {
			let item_name = $(item).find('p.name > a > span').text();
			let item_price = $(item).find('p.info > span.pull-left > span.price').text().trim().replace(/\s/g, '').substring(1); // RMB, ¥
			$(item).append('<button class="btn btn-primary checkrate" data-price="'
			+ item_price + '" data-itemname="'
			+ item_name + '" onclick="c5ratechecker(this)">Check rate</button>');
		});
	}
	function getDataFromLocal(appid) {
		const storage_key = 'items_' + appid + '_storage';
		var temp_storage = JSON.parse(localStorage.getItem(storage_key));
		if (temp_storage && Array.isArray(temp_storage)) {
			return temp_storage
		} else {
			delete localStorage.removeItem(storage_key);
		}
		return [];
	}
}

// declear
const URL_PROXY = 'https://cors-anywhere.herokuapp.com/'; // to disable CORS
// const STEAM_API = "https://steamcommunity.com/market/priceoverview/?appid=570&currency=1&market_hash_name=";
const STEAM_LIST_API = "https://steamcommunity.com/market/itemordershistogram?country=VN&language=english&currency=1&item_nameid=";
const STEAM_LIST_LINK = 'https://steamcommunity.com/market/listings/';
// end declear

async function c5ratechecker(element) {
	let instant = $(element);
	let item_price = instant.attr('data-price');
	let item_name = instant.attr('data-itemname');
	console.clear();
	let steam_data = null;
	let item_nameid = null;
	// check items in localStorage 
	for (let el of items_steam) {
		if (el.name == item_name) {
			item_nameid = el.nameid;
			console.log('Get item_namid of ' + item_name + ' in localStorage');
			break;
		}
	}
	if (item_nameid == null) {
		console.log('Get item_namid of ' + item_name + ' by API');
		item_nameid = await getItemId(item_name, appid);
	}
	// end check
	if (item_nameid != 0 && appid != null) {
		steam_data = await getData(STEAM_LIST_API + item_nameid);
		// console.log(steam_data);
		if (steam_data.success == 1) {
			let order_rate = 0;
			let sell_rate = 0;
			let rate_wallet = document.getElementById('content').getAttribute('e_wallet_rate');
			const highest_buy_order = parseFloat(steam_data.highest_buy_order) / 100;
			const lowest_sell_order = parseFloat(steam_data.lowest_sell_order) / 100;
			// start log
			console.log('Searching for ' + item_name);
			console.log('- rate wallet:', rate_wallet);
			console.log('- highest buy order: ', highest_buy_order);
			console.log('- lowest sell order: ', lowest_sell_order);
			// end log
			if (highest_buy_order) {
				order_rate = calcRate(rate_wallet, item_price, highest_buy_order);
			}
			if (lowest_sell_order)
				sell_rate = calcRate(rate_wallet, item_price, lowest_sell_order);
			// fill in text
			instant.text('[ord: ' + order_rate + '; sell: ' + sell_rate + ']');
		}
	}
	function calcRate(rate_wallet, etop_price, steam_price) {
		return Number.parseFloat(steam_price * rate_wallet / etop_price).toFixed(2);
	}
}

function getData(uri_api) {
	return $.get(URL_PROXY + uri_api, function (res) {
		try {
			console.log("Success fetch data");
		} catch (err) {
			console.log("Error: " + err);
		}
	});
}

async function getItemId(item_name, appid) {
	const regex = /Market_LoadOrderSpread\((.*?)\)/gm;
	let m;
	let data = await getData(STEAM_LIST_LINK + appid + '/' + item_name);
	while ((m = regex.exec(data)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		// The result can be accessed through the `m`-variable.
		for (let match of m) {
			if (parseInt(match.trim()) >= 0) {
				let value = match.trim();
				items_steam.push({ name: item_name, nameid: value });
				localStorage.setItem('items_' + appid + '_storage', JSON.stringify(items_steam));
				console.log('item_nameid: ', value);
				return value;
			}
		}

	}
}