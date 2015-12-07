function pluralize(num, str) {
	return num === 1 ? str : str + "s";
}

function TradePanel(id, total_id) {
	this.panel = $("#" + id);
	this.total = $("#" + total_id);
	this.total_change_listeners = [];
	this.display_start_idx = 0;
	this.num_elements = 0;
	this.MAX_ELEMENTS = 14;
	var add_button = $(this.makeElement("Add", "glyphicon-plus"));
	add_button.children(".list-text").attr("readonly", true).addClass("unselectable");
	add_button.click($.proxy(function () {
		this.addElement();
	}, this));
	this.recompute();
};

TradePanel.prototype.addElement = function(text, icon_class, amt) {
	text = text || "Hand jibbers";
	icon_class = icon_class || "glyphicon-remove-circle";
	amt = amt || "0.0";
	if (this.num_elements < this.MAX_ELEMENTS) {
		this.num_elements++;
		var new_element = this.makeElement(text, icon_class, amt);
		new_element.children(".list-icon").click($.proxy(function(e) {
			console.log("Remove");
			$(e.target).parent().remove();
			this.num_elements--;
			this.recompute();
		}, this));
	}
};

TradePanel.prototype.makeElement = function(text, icon_class, amt) {
	var container = $("<div class='list-item'></div>")
	var icon = $("<span class='list-icon glyphicon " + icon_class + "'></span>")
	container.append(icon);
	if (amt !== undefined) {
		var amt_el = $("<input class='list-amt' type='text'></input>");
		amt_el.val(amt);
		amt_el.on('input', $.proxy(function() {
			this.recompute();
		}, this));
		container.append(amt_el);
	}
	var text_el = $("<input class='list-text' type='text'></input>");
	text_el.val(text);
	container.append(text_el);
	this.panel.append(container);
	return container
};

TradePanel.prototype.recompute = function() {
	var sum = 0.0;
	$.each(this.panel.children().children(".list-amt"), function(idx, obj) {
		var val = parseFloat($(obj).val());
		if (isNaN(val) || !isFinite(val)) {
			return true;
		}
		sum += val;
	});
	this.total.val(sum + " " + pluralize(sum, "cap"));
	$.each(this.total_change_listeners, function(idx, obj) {
		obj(sum);
	});
};

TradePanel.prototype.addTotalChangeListener = function(listener) {
	this.total_change_listeners.push(listener);
};

TradePanel.prototype.toJSON = function() {
	var arr = [];
	$.each(this.panel.children(), function(idx, obj) {
		var amt = $(obj).children(".list-amt").val();
		if (amt === undefined) {
			return true;
		}
		var text = $(obj).children(".list-text").val();
		arr.push({"amt": amt, "text": text});
	});
	return arr;
};

function TradeScreen(left_panel_id, right_panel_id) {
	this.left_trade_panel = new TradePanel(left_panel_id, left_panel_id + "-total");
	this.right_trade_panel = new TradePanel(right_panel_id, right_panel_id + "-total");
	this.left_sum = 0.0;
	this.right_sum = 0.0;
	this.left_trade_panel.addTotalChangeListener($.proxy(this.leftSumChange, this));
	this.right_trade_panel.addTotalChangeListener($.proxy(this.rightSumChange, this));
	$(window).on('beforeunload', $.proxy(function() {
		console.log('before unload');
        this.saveState();
    }, this));
  this.loadState();
	this.updateArrow();
};

TradeScreen.prototype.updateArrow = function() {
	var diff = Math.abs(this.left_sum - this.right_sum);
	$("#total-box").text(diff + " " + pluralize(diff, "cap"));
	if (this.left_sum === this.right_sum) {
		$("#total-box-left-arrow").css('visibility', 'hidden');
		$("#total-box-right-arrow").css('visibility', 'hidden');
	} else if (this.left_sum > this.right_sum) {
		$("#total-box-left-arrow").css('visibility', 'hidden');
		$("#total-box-right-arrow").css('visibility', 'visible');
	} else if (this.left_sum < this.right_sum) {
		$("#total-box-left-arrow").css('visibility', 'visible');
		$("#total-box-right-arrow").css('visibility', 'hidden');
	}
};

TradeScreen.prototype.leftSumChange = function(new_sum) {
	this.left_sum = new_sum;
	this.updateArrow();
};

TradeScreen.prototype.rightSumChange = function(new_sum) {
	this.right_sum = new_sum;
	this.updateArrow();
};

TradeScreen.prototype.saveState = function() {
	var left = this.left_trade_panel.toJSON();
	var right = this.right_trade_panel.toJSON();
	var left_name = $("#left-name-input").val();
	var right_name = $("#right-name-input").val();
	var state = {
		"left_items": left,
		"right_items": right,
		"left_name": left_name,
		"right_name": right_name,
	};
	localStorage.setItem('state', JSON.stringify(state));
};
TradeScreen.prototype.loadState = function() {
	var state_str = localStorage.getItem('state');
	if (state_str) {
		var state = JSON.parse(state_str);
		$("#left-name-input").val(state["left_name"]);
		$("#right-name-input").val(state["right_name"]);
		$.each(state["left_items"], $.proxy(function(idx, obj) {
			this.left_trade_panel.addElement(obj["text"], "glyphicon-remove-circle", obj["amt"]);
		}, this));
		$.each(state["right_items"], $.proxy(function(idx, obj) {
			this.right_trade_panel.addElement(obj["text"], "glyphicon-remove-circle", obj["amt"]);
		}, this));
		this.left_trade_panel.recompute();
		this.right_trade_panel.recompute();
	}
};

function run() {
	trade_screen = new TradeScreen("left-trade-box", "right-trade-box");
};
$(run);
