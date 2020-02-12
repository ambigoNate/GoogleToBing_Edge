function getParameter(name){
	hashornot = window.location.search;
	if(document.URL.indexOf("#")!==-1){hashornot=window.location.hash.replace("#","#hold=1&");}
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec(hashornot);
	if( results == null )
		return "";
	else
		return results[1];
}

function whichSite() {
	sEngine = null;
	if (location.hostname.indexOf(".google.")!==-1){
		sEngine = "google";
	}
	else if (location.hostname.indexOf(".bing.com")!==-1){
		sEngine = "bing";
	}
	return(sEngine);
}

function issearchorimage(){
	searchType = null;
	site = whichSite();
	if(site !== null){
		if(((document.URL.indexOf("/webhp") !== -1) ||
			(document.URL.indexOf("/search") !== -1) ||
			(document.URL.indexOf("/#") !== -1) || 
			(document.URL.indexOf("/news" !== -1)) ||
			(document.URL.indexOf("/video") !== -1) ||
			(document.URL.indexOf("#newwindow") !== -1)) && 
			(getParameter("q")!==""))
		{
			if ((site == "bing")&&(document.URL.indexOf("/images/")!==-1)){
				searchType = "image"
			}
			else if ((site=="bing")&&(document.URL.indexOf(".com/search")!==-1)){
				searchType = "web";
			}
			else if ((site=="google")&&(getParameter("tbm")=="isch")){
				searchType = "image";
			}
			else if ((site=="google")&&(getParameter("tbm")=="")){
				searchType = "web";
			}
			else if((site=='google') && (getParameter("tbm")=='nws')) {
				searchType = "news";
			}
			else if((site=='bing') && (document.URL.indexOf("/news/") !== -1)) {
				searchType = "news";
			}
			else if((site == 'google') && (getParameter("tbm")=="vid")) {
				searchType = "video";
			} 
			else if((site == 'bing') && (document.URL.indexOf("/videos/") !== -1)) {
				searchType = "video";
			}
		}
	}
	//console.log("Site/Searchtype:" + site + " / " + searchType);
	return([site, searchType]);
}

function start_script(){
	console.log("Starting GoogleToBing...");
	link = null;
	data = issearchorimage();
	destDomain = "bing";
	query = getParameter("q");
	if (data[1] !== null){
		site_name = data[0];
		searchType = data[1];
		if (site_name == "google"){
			img_link = chrome.extension.getURL("icons/g2b.png");
		}
		else if (site_name=="bing"){
			img_link = chrome.extension.getURL("icons/b2g.png");
			destDomain = "google";
		}
		if(searchType == "web"){
			link = `//www.${destDomain}.com/search?q=${query}`;
		}
		else if(searchType == "image"){
			if(site_name == "google"){
				link = `//www.bing.com/images/search?q=${query}`;
			}
			else if(site_name == "bing"){
				link = `//www.google.com/search?q=${query}&tbm=isch`;
			}
		}
		else if(searchType == "news") {
			if(site_name == "google"){
				link = `//www.bing.com/news/search?q=${query}`;
			} else if(site_name == "bing") {
				link = `//www.google.com/search?q=${query}&tbm=nws`;
			}
		}
		else if(searchType == "video") {
			if(site_name == "google") {
				link = `//www.bing.com/videos/search?q=${query}`;
			} else if(site_name == "bing") {
				link = `//www.google.com/search?q=${query}&tbm=vid`;
			}
		}
	}
	if(link != null){
		if(!document.getElementById("bingtogoogle")){
			console.log("G2B: Creating button with " + data[0]);
			create_button(data[0], link);
		}
		else{
			console.log("G2B: Update link.");
			updateLink(link);
		}
	}
	return(link);
}

function create_button(site_name, link){
	if(site_name=="google"){
		img_link = chrome.extension.getURL("icons/g2b.png");
	}
	else if (site_name=="bing"){
		img_link = chrome.extension.getURL("icons/b2g.png");
	}
	var mydiv = document.createElement('div');
	mydiv.setAttribute('style', 'background-image:url("'+img_link+'");'+ cssProp);
	mydiv.setAttribute('id', 'bingtogoogle');
	var mylink = document.createElement('a');
	mylink.appendChild(mydiv);
	mylink.setAttribute("id", "clickme");
	$(mydiv).draggable({
		stop: function( event, ui ) {
			windowHeight = $(window).height();
			windowWidth = $(window).width();
			right = windowWidth - (buttonSize + ui.position.left);
			bottom = windowHeight - (buttonSize + ui.position.top);
			chrome.storage.sync.set({"bottom": bottom, "right": right},null);
		},
		containment: "window",
		distance: 10
	});
	$(mylink).hide();
	mylink.setAttribute("href", link);
	document.body.appendChild(mylink);
	$("#clickme").show();
}

function updateLink(link){
	var clickme = document.getElementById("clickme");
	clickme.setAttribute("href", link);
}

var query;
var buttonSize = 45;
var cssProp = '-webkit-box-shadow: 0px -1px 7px rgba(50, 50, 50, 0.75); box-shadow: 0px -1px 7px rgba(50, 50, 50, 0.75); background-size:100%; width:'+buttonSize+'px; height:'+buttonSize+'px; position:fixed; right:2px; bottom:2px; z-index:999999999; cursor:pointer;';
var linkDest = start_script();

window.onresize = function(e){
	if(document.getElementById("bingtogoogle")){
		keys = ["bottom", "right"];
        	chrome.storage.sync.get(keys, function(result){
                	$("#clickme div").css("right",result.right);
               		$("#clickme div").css("bottom",result.bottom);
                        $("#clickme div").css("left", "auto");
                        $("#clickme div").css("top", "auto");
       		});
	}
}

window.onhashchange = function(e){
    e = e || window.event;
    linkDest = start_script();
}
