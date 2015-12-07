function TradePanel(id) {
	this.panel = $("#" + id);
	this.items = [];
	this.display_start_idx = 0;
	this.DISPLAY_ELEMENTS = 5;
	var add_button = $(this.addElement("Add", "glyphicon-plus"));
	add_button.children(".list-text").attr("readonly", true).addClass("unselectable");
	add_button.click($.proxy(function () {
		console.log(this);
		this.addElement("New Item", "glyphicon-stop", "0.0");
	}, this));
};

TradePanel.prototype.addElement = function(text, icon_class, amt) {
	var container = $("<div class='list-item'></div>")
	var icon = $("<span class='list-icon glyphicon " + icon_class + "'></span>")
	container.append(icon);
	if (amt !== undefined) {
		var amt_el = $("<input class='list-amt' type='text'></input>");
		amt_el.val(amt);
		container.append(amt_el);
	}
	var text_el = $("<input class='list-text' type='text'></input>");
	text_el.val(text);
	container.append(text_el);
	this.panel.append(container);
	return container
};

function TradeScreen(left_panel_id, right_panel_id) {
	this.left_trade_panel = new TradePanel(left_panel_id);
	this.right_trade_panel = new TradePanel(right_panel_id);
};

function run() {
	trade_screen = new TradeScreen("left-trade-box", "right-trade-box");
};

$(run);