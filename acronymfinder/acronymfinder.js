var noun_type_category_acronymfinder = CmdUtils.NounType(
    "category", {
        IT: "Information-Technology/",
        Gov: "Military-and-Government/",
        Science: "Science-and-Medicine/",
        Org: "Organizations/",
        Business: "Business/",
        Slang: "Slang/"
	    }); 

CmdUtils.CreateCommand({
  names: ["acronymfinder", "af", "search using acronymfinder"],
  icon: "http://acronymfinder.com/favicon.ico",
  author: { name: "Mor Griv" },
  homepage: "https://github.com/morgriv/userscripts/acronymfinder",
  license: "GPL",
  description: _("Searches AcronymFinder.com for an acronym defenition."),
  help: _("Highlight an acronym and acronymfinder will find out what it stands for"),
  arguments: [ { role: 'object', nountype: noun_arb_text, label: 'acronym' },
               { role: 'format', nountype: noun_type_category_acronymfinder, label: 'category' } ],
  preview: function(previewBlock, args) {
    searchText = jQuery.trim(args.object.text);
    if (searchText.length <= 0) {
      previewBlock.innerHTML = _("Search AcronymFinder.com");
      return;
    }
	
    // handle the category
    var inCat = jQuery.trim(args.format.data);
	Utils.reportInfo(inCat);

    var previewTemplate = "Searches AcronymFinder.com for expansions of the acronym <b>${QUERY}</b>"; 
    var previewData = { QUERY: searchText }; 
    previewBlock.innerHTML = _(previewTemplate, previewData); 

    var previewUrlTemplate = "http://www.acronymfinder.com/${CATEGORY}${QUERY}.html";
	var previewUrlData = { QUERY: searchText, CATEGORY: inCat }; 
	var previewUrl = CmdUtils.renderTemplate(previewUrlTemplate, previewUrlData)
	Utils.reportInfo(previewUrl);
	
    CmdUtils.previewAjax(previewBlock, {
      url: previewUrl,
      type: "GET",
      success: function(htmlData, textStatus) {
        var doc = context.focusedWindow.document;
        var domDiv = doc.createElement("div");
        domDiv.innerHTML = htmlData;
        var content = jQuery("#ListResults > tbody > tr:gt(1) > td:nth-child(3)", domDiv);
        if (content.length == 0) {
          // Not a multi-results, let's try a single match.
          content = jQuery("h2", domDiv);
          if (content.length == 0) {
            // No results at all.
            previewBlock.innerHTML = _("No direct matches.<br> <b>Hit enter for suggested alternative searches...</b>");
            return;
          }
        }
        // Found muti-result page.
        previewBlock.innerHTML = "";
        for (var i = 0; i < content.length; i++) {
          previewBlock.innerHTML += content.eq(i).html() + "<br>";
        }
        previewBlock.innerHTML += _("<br><b>Hit enter for more information...</b>");
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        template = "Failed in fetching AcronymFinder.com defenitions for ${QUERY} due to a ${status}.";
        previewBlock.innerHTML = _(template, { "QUERY": this.data, "status": textStatus });
      }
    });
  },
  execute: function(args) {
    searchText = jQuery.trim(args.object.text);
    if (searchText.length <= 0) {
      previewBlock.innerHTML = _("Search AcronymFinder.com");
      return;
    }
	
    // handle the category
    var inCat = jQuery.trim(args.format.data);

    var execUrlTemplate = "http://www.acronymfinder.com/${CATEGORY}${QUERY}.html";
	var execUrlData = { QUERY: searchText, CATEGORY: inCat }; 
	var execUrl = CmdUtils.renderTemplate(execUrlTemplate, execUrlData)
	Utils.reportInfo(execUrl);
    Utils.openUrlInBrowser(execUrl);
  }
});
