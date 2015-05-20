$(document).ready(function() {
	if (location.pathname.split("/")[1] == "status") {
		if (location.pathname.split("/")[2] !== undefined && location.pathname.split("/")[2] !== "") {
			showInformation(location.pathname.split("/")[2]);
		} else {
			history.replaceState('data', '', '/');
		}
	}

	loadWebsiteData();
});

function showInformation(website) {
	if (website == "") {
		return;
	}

	$.ajax({
		url: "/api/status/" + website,
		type: "GET",
		success: function(data) {
			var dataString = '<div class="well"><legend>Information about ' + website + '</legend>';
			dataString += '<p>The website at <a href="' + data.websiteData.url + '">' + data.websiteData.url + '</a> is called <b>"' + data.websiteData.name + '"</b>, was checked <b>' + data.availability.total + ' times</b> and has an average availability of <b>' + data.availability.average + '</b>.</p>';

			if (data.lastCheckResult.status !== 'unknown') {
				var dateRecent = new Date(data.lastCheckResult.time.replace(' ', 'T'));
				dataString += '<p>The most recent check on <b>' + dateRecent.toLocaleDateString() + '</b> at <b>' + dateRecent.toLocaleTimeString() + '</b> got the following response: <b>' + data.lastCheckResult.status + '</b></p>';
			}

			if (data.lastFailedCheckResult.status !== 'unknown') {
				var dateFail = new Date(data.lastFailedCheckResult.time.replace(' ', 'T'));
				dataString += '<p>The last failed check on <b>' + dateFail.toLocaleDateString() + '</b> at <b>' + dateFail.toLocaleTimeString() + '</b> failed because of this response: <b>' + data.lastFailedCheckResult.status + '</b></p>';
			}

			dataString += '<button class="btn btn-primary" onclick="hideInformation()">Close</button></div>';

			$('#col-form-information').html(dataString);

			// show everything to the user
			$('#button-information').text('Loading...');
			$('#bc-feature').css('display', 'inline-block').text('Status');
			$('#bc-site').css('display', 'inline-block').text(website).html('<a href="/status/' + website + '">' + website + '</a>');
			history.replaceState('data', '', '/status/' + website + '/');

			$('#row-information').show();
		},
		error: function(error) {
			$('.bottom-right').notify({
				type: 'danger',
				message: {text: "Sorry, but I was unable to process your request. Error: " + JSON.parse(error.responseText).message},
				fadeOut: {enabled: true, delay: 3000}
			}).show();
		}
	});
}

function hideInformation() {
	$('#row-information').hide();

	$('#bc-feature').css('display', 'none').text('');
	$('#bc-site').css('display', 'none').text('');
	history.replaceState('data', '', '/');
}

function loadWebsiteData() {
	$.ajax({
		url: "/api/websites",
		type: "GET",
		success: function(data) {
			loadedWebsiteData = data.websites;
			var dataStringUp = '';
			var dataStringDown = '';
			var newEntry = '';
			for (var i = 0; i < loadedWebsiteData.length; i++) {
				newEntry = '';

				newEntry += '<tr><td>' + (i + 1) + '</td><td><a href="' + loadedWebsiteData[i].protocol + '://' + loadedWebsiteData[i].url + '" target="_blank">' + loadedWebsiteData[i].name + '</a></td><td>';

				if (loadedWebsiteData[i].status.indexOf("200") > -1) {
					newEntry += ' <span class="label label-success">' + loadedWebsiteData[i].status + '</span> ';
				} else if (loadedWebsiteData[i].status.indexOf("301") > -1 || loadedWebsiteData[i].status.indexOf("302") > -1) {
					newEntry += ' <span class="label label-warning">' + loadedWebsiteData[i].status + '</span> ';
				} else {
					newEntry += ' <span class="label label-danger">' + loadedWebsiteData[i].status + '</span> ';
				}

				newEntry += '</td><td> <span class="label label-primary" id="label-action" onclick="showInformation(\'' + loadedWebsiteData[i].url + '\')">More</span> </td></tr>';

				if (loadedWebsiteData[i].status.indexOf("200") > -1) {
					dataStringUp += newEntry;
				} else {
					dataStringDown += newEntry;
				}
			}

			if (dataStringUp === '') {
				dataStringUp = '<tr><td colspan="4">No websites found.</td></tr>';
			}
			if (dataStringDown === '') {
				dataStringDown = '<tr><td colspan="4">No websites found.</td></tr>';
			}

			$('#table-websites-up').html(dataStringUp);
			$('#table-websites-down').html(dataStringDown);
		},
		error: function(error) {
			$('#table-websites-up').html('<tr><td colspan="4">An error occured: ' + JSON.parse(error.responseText).message + '</td></tr>');
			$('#table-websites-down').html('<tr><td colspan="4">An error occured: ' + JSON.parse(error.responseText).message + '</td></tr>');
		}
	});
}