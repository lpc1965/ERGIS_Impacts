require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/rest/query", 
    "esri/rest/support/Query",
    "esri/layers/GraphicsLayer",
    "esri/layers/VectorTileLayer",
    "esri/renderers/SimpleRenderer",
    "esri/widgets/Search"
  ], 
  ( Map, 
    MapView, 
    FeatureLayer, 
    query, 
    Query, 
    GraphicsLayer, 
    VectorTileLayer, 
    SimpleRenderer,
    Search) => {

    const resultsLayerPUID = new GraphicsLayer();

    const lpcLotEffect = "drop-shadow(-1px, 1px, 1px gray)"

    const resultsLayerLPC = new GraphicsLayer({
      effect: lpcLotEffect
    });

    const fedLotEffect =  "drop-shadow(-5px, 5px, 3px gray)"  

    const resultsLayerFED = new GraphicsLayer({
      effect: fedLotEffect
    });

    const ergisRenderer = new SimpleRenderer({
        symbol: {
          type: "simple-marker", 
          color: [193, 39, 45, 1],
          outline: {
            color: [255, 255, 255, 0.7],
            width: 0.5
          },
          size: 6
        }
    });

    const ergisEffect =  "drop-shadow(-4px, 4px, 2px gray)"

    const ergis = new FeatureLayer({
      title: "Ergis Points",
      url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/ERGIS_Impact_Points_CCD/FeatureServer/0",
      visible: false,
      renderer: ergisRenderer,
      effect: ergisEffect,
      popupTemplate: {
        title: "PUID# {PUID}",
        outFields: ["*"],
        content: popupContent,
      }
    });

    function popupContent (feature) {
        const div = document.createElement("div");

        let date = feature.graphic.attributes.DTCOMPLETE
        var dateVar = new Date(date);
        var fdate = ("0" + (dateVar.getMonth() + 1)).slice(-2) + '-' + ("0" + dateVar.getDate()).slice(-2) + '-' + dateVar.getFullYear();

        div.innerHTML =
          "Site Name: " + feature.graphic.attributes.SITENAME + "<br/>" +
          "Address:  " + feature.graphic.attributes.ADDRESS + "<br/>" +
          "LPC Finding:  " + feature.graphic.attributes.LPCIMPACT + "<br/>" +
          "Fed Finding:  " + feature.graphic.attributes.FEDIMPACT + "<br/>" +
          "Date Complete:  " + fdate + "<br/>";
        return div;
      };

    const ergisUrl = "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/ERGIS_Impact_Points_CCD/FeatureServer/0";

    const arcadeScript = document.getElementById("ergis-arcade").text;

    /****Add Pluto Data from DCP data service*****/

    const taxLots = new FeatureLayer({
      title: "U.S. Census Block Groups",
      url: "http://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer/0/",
      definitionExpression: "Council = 01",
      popupTemplate: {
        title: "Tax Lot Address: {Address}<br>BBL: {BBL}",
        content: "{expression/ergis-sites}",
        expressionInfos: [
          {
            name: "ergis-sites", // Points to Arcade script for popup
            title: "ERGIS Sites",
            expression: arcadeScript
          }
        ]
      },
      renderer: {
        type: "simple", 
        symbol: {
          type: "simple-fill",
          color: [202, 208, 219, 0],
          outline: {
            color: "#202f49",
            width: 0.2,
            style: "solid"    
          }
        }
      }
    });

    /******Add City Council Districts******/

    const ccdRenderer = {
        type: "simple",
        symbol: {
            type: "simple-fill", 
            color: [255, 255, 255, 0],  
            outline: {
            color: [0, 0, 0, 1],     
            width: 2,  
            }
        }
    };
    
    const ccdLabel = {    
        symbol: {
            type: "text", 
            color: "black",
            haloColor: "white",
            haloSize: 1,  
            font: { 
                family: "Poppins",
                size: 12,
                weight: "bold",
            }
        },
        maxScale: 0,
        minScale: 36112,    
        labelPlacement: "above-center",
        labelExpressionInfo: {
            expression: "'Council District: ' + $feature.COUNDIST"
        }
        };

    const ccdBoundaries = new FeatureLayer({
        url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/City_Council_Districts_2022/FeatureServer",   
        maxScale: 0,
        minScale: 0,
        opacity: 0.9,    
        legendEnabled: true,
        visible: true,  
        popupEnabled: false,    
        renderer: ccdRenderer,
        labelingInfo: [ccdLabel],
        labelsVisible: true
        });

    /******Add LPC Interior Landmarks******/

    const intRenderer = new SimpleRenderer({
        symbol: {
          type: "simple-marker",
          color: [110,135,227, 1],
          outline: {
            color: [255, 255, 255, 0.7],
            width: 1
          },
          size: 8
        }
    });

    const intLabel = {    
        symbol: {
          type: "text", 
          color: "black",
          haloColor: "white",
          haloSize: 1,  
          font: { 
            family: "Poppins",
            size: 8,
          }
        },
        maxScale: 0,
        minScale: 18055,    
        labelPlacement: "above-center",
        labelExpressionInfo: {
          expression: "$feature.LM_NAME"
        }
    };

    const lpcInt = new FeatureLayer({
      url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/Interiors/FeatureServer",
      visible: false,
      renderer: intRenderer,
      popupEnabled: false,
      labelingInfo: [intLabel],
      labelsVisible: true 
    });

    /******Add LPC Individual Landmarks******/

    const indRenderer = {
        type: "simple",
        symbol: {
          type: "simple-fill", 
          color: [240,148,215, 0.2],  
          outline: {
            color: [138, 45, 113, 0.5],     
            width: 1,  
          }
        }
    };
    
    const indLabel = {    
        symbol: {
          type: "text", 
          color: "black",
          haloColor: "white",
          haloSize: 1,  
          font: { 
                family: "Poppins",
                size: 8,
          }
        },
        maxScale: 0,
        minScale: 18055,    
        labelPlacement: "above-center",
        labelExpressionInfo: {
          expression: "$feature.LPC_NAME"
        }
      };

    const lpcInd = new FeatureLayer({
        url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/Ind_Landmark_Lots_POLY/FeatureServer",    
        maxScale: 0,
        minScale: 0,
        opacity: 0.9,    
        legendEnabled: true,
        visible: false,    
        popupEnabled: false,    
        renderer: indRenderer,
        labelingInfo: [indLabel],
        labelsVisible: true
      });

    /******Add LPC Historic Districts******/

    const hdRenderer = {
        type: "simple",
        symbol: {
          type: "simple-fill", 
          color: [252,223,104, 0.2], 
          outline: {
                color: [99, 88, 41, 0.5],     
                width: 1,  
          }
        }
    };
    
    const hdLabel = {    
        symbol: {
          type: "text", 
          color: "black",
          haloColor: "white",
          haloSize: 1,  
          font: { 
            family: "Poppins",
            size: 8,
          }
        },
        maxScale: 0,
        minScale: 18055,    
        labelPlacement: "above-center",
        labelExpressionInfo: {
          expression: "$feature.AREA_NAME"
        }
      };

    const lpcHd = new FeatureLayer({
        url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/Historic_Districts/FeatureServer",    
        maxScale: 0,
        minScale: 0,
        opacity: 0.9,    
        legendEnabled: true,
        visible: false,  
        popupEnabled: false,    
        renderer: hdRenderer,
        labelingInfo: [hdLabel],
        labelsVisible: true
      });

    /*******Add LPC Scenic Landmarks*******/

    const sceRenderer = {
        type: "simple",
        symbol: {
          type: "simple-fill", 
          color: [149,185,131, 0.2],  
          outline: {
                color: [50, 92, 28, 0.5],     
                width: 1,  
          }
        }
    };
    
    const sceLabel = {    
        symbol: {
          type: "text", 
          color: "black",
          haloColor: "white",
          haloSize: 1,  
          font: { 
            family: "Poppins",
            size: 8,
          }
        },
        maxScale: 0,
        minScale: 18055,    
        labelPlacement: "above-center",
        labelExpressionInfo: {
          expression: "$feature.SCEN_LM_NA"
        }
      };

    const lpcSce = new FeatureLayer({
        url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/Scenic/FeatureServer",    
        maxScale: 0,
        minScale: 0,
        opacity: 0.9,    
        legendEnabled: true,
        visible: false,  
        popupEnabled: false,    
        renderer: sceRenderer,
        labelingInfo: [sceLabel],
        labelsVisible: true
    });

    /*******Add LPC Scenic Landmarks*******/  

    const dcpLabel = {    
      symbol: {
        type: "text", 
        color: "black",
        haloColor: "white",
        haloSize: 1,  
        font: { 
          family: "Poppins",
          size: 10,
        }
      },
      maxScale: 0,
      minScale: 30000,    
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "$feature.PROJECT_NA + TextFormatting.NewLine + 'PUID: ' + $feature.PUID"
      }
    };

    const dcpStudyAreas = new FeatureLayer({
      title: "DCP Study Areas",
      url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/DCP_Study_Areas/FeatureServer",
      maxScale: 0,
      minScale: 0,
      visible: false,
      labelingInfo: [dcpLabel],
      labelsVisible: true,
      renderer: {
        type: "simple", 
        symbol: {
          type: "simple-fill",
          color: [66, 206, 245, 0.1],
          outline: {
            color: "#177791",
            width: 1,
            style: "solid"    
          }
        }
      }
    });

    const dcpStudyAreasBuff = new FeatureLayer({
      title: "DCP Study Areas",
      url: "https://services5.arcgis.com/Oos4pNA2538iVFA1/arcgis/rest/services/DCP_Study_Areas_Buffers/FeatureServer",
      maxScale: 0,
      minScale: 0,
      visible: false,
      renderer: {
        type: "simple", 
        symbol: {
          type: "simple-fill",
          color: [202, 208, 219, 0],
          outline: {
            color: "#000",
            width: 1.5,
            style: "dash"    
          }
        }
      }
    });

    /******Variable used to narrow down ERGIS points during impact finding queries******/

    let ccdVar = [01];

    /******Params for PUID and LPCIMACT Queries******/

    const params = new Query({
      returnGeometry: true,
      outFields: ["*"]
    });

    const paramsTwo = new Query({
      returnGeometry: true,
      outFields: ["*"]
    });

    const paramsThree = new Query({
        returnGeometry: true,
        outFields: ["*"]
    });

    const tileBaseMap = new VectorTileLayer({
        url:"https://tiles.arcgis.com/tiles/yG5s3afENB5iO9fj/arcgis/rest/services/NYC_Basemap/VectorTileServer",
        opacity: 0.6
    });

    /******Set Map View*******/

    const view = new MapView({
      container: "viewDiv",
      map: new Map({
        //basemap: "topo-vector",
        layers: [tileBaseMap, dcpStudyAreas, lpcSce, lpcHd, lpcInd, lpcInt, taxLots, ccdBoundaries, resultsLayerLPC, resultsLayerPUID, resultsLayerFED, ergis, dcpStudyAreasBuff],
        /*basemap: {
            portalItem: {
              id: "75a08e8cd8b64dcfa6945bb7f624ccc5"
            }
        }*/
      }),
      center: [-74.01066882816491, 40.707160437068474],
      zoom: 14,
      /*highlightOptions: {
        fillOpacity: 0.5,
        haloColor: "white"
      },*/
      popup: {
        collapseEnabled: false,
        dockEnabled: true,
        dockOptions: {
          breakpoint: false,
          position: "bottom-right"
        }
      },
      constraints: {
        minZoom: 10
      },
      ui: {
        components: [""]
      }
    });

    view.ui.move("zoom", 'bottom-left');
    view.popup.viewModel.includeDefaultActions = false;

    /*******Layer button for all ERGIS points*******/

    var layerButton = document.getElementById("layerButton");

    layerButton.addEventListener("click", function() {
        if (ergis.visible == false) {
            ergis.visible = true;
            document.getElementById("ergisVis").style.display="flex"
        } else {
          ergis.visible = false;
          document.getElementById("ergisVis").style.display="none"
        }
    });

    /******Looping Code to fill in dropdown with all CCD Field Values******/

    view
    .when(function() {
      return ccdBoundaries.when(function() {
        var query = ccdBoundaries.createQuery();
        return ccdBoundaries.queryFeatures(query);
      });
    })
    .then(getValuesCcd)
    .then(getUniqueValuesCcd)
    .then(addToSelectCcd);

    function getValuesCcd(response) {
    var features = response.features;
    var values = features.map(function(feature) {
      return feature.attributes.COUNDIST;
    });
    return values;
    }

    function getUniqueValuesCcd(values) {
    let tempUniqueValues = [];
    values.forEach(function(item, i) {
      if (
        (tempUniqueValues.length < 1 || tempUniqueValues.indexOf(item) === -1) &&
        item !== ""
      ) {
        tempUniqueValues.push(item);
      }
    });

    return tempUniqueValues;
    }

    function addToSelectCcd(values) {
    values.sort();
    values.forEach(function(value) {
      var option = document.createElement("option");
      option.text = `'${value}'`;
      option.label = value;
      option.id = value;
      ccdFilter.selectize.addOption(option);
    });
    }

    /******Looping Code to fill in dropdown with all LPCIMPACT Field Values******/

    view
      .when(function() {
        return ergis.when(function() {
          var query = ergis.createQuery();
          return ergis.queryFeatures(query);
        });
      })
      .then(getValues)
      .then(getUniqueValues)
      .then(addToSelect);

    function getValues(response) {
      var features = response.features;
      var values = features.map(function(feature) {
        return feature.attributes.LPCIMPTWO;
      });
      return values;
    }

    function getUniqueValues(values) {
      let tempUniqueValues = [];
      values.forEach(function(item, i) {
        if (
          (tempUniqueValues.length < 1 || tempUniqueValues.indexOf(item) === -1) &&
          item !== ""
        ) {
          tempUniqueValues.push(item);
        }
      });
      
      //let removeValues = ['ADJACENT DESIGNATED LANDMARK', 'ADJACENT HISTORIC DISTRICT', 'ADJACENT POTENTIAL HISTORIC DIST.','BLDG. NEAR ELIGIBLE HISTORICT DIST.','BLDG. W/IN DESIGNATED HISTORIC DIST','BUILDING NEAR HISTORIC DISTRICT','CALENDARED AND HEARD BY LPC','CALENDARED BY LPC','NO INTEREST','PROJECT CONTAINS SIGNIFICANT BLDGS.','PROJECT NEAR SIGNIFICANT BLDGS.','SIGNIFICANCE NOT DETERMINED','SIGNIFICANT BUT NOT ELIGIBLE'];
      let removeValues = ['NA'];
      let uniqueValues = tempUniqueValues.filter(item => !removeValues.includes(item));

      return uniqueValues;
    }


    function addToSelect(values) {
      values.sort();
      values.forEach(function(value) {
        var option = document.createElement("option");
        option.text = `'${value}'`;
        option.label = value;
        lpcFilter.selectize.addOption(option);
      });
    }

    /******Looping Code to fill in dropdown with all FEDIMPACT Field Values******/

    view
      .when(function() {
        return ergis.when(function() {
          var queryTwo = ergis.createQuery();
          return ergis.queryFeatures(queryTwo);
        });
      })
      .then(getValuesTwo)
      .then(getUniqueValuesTwo)
      .then(addToSelectTwo);  

    function getValuesTwo(response) {
      var features = response.features;
      var values = features.map(function(feature) {
        return feature.attributes.FEDIMPTWO;
      });
      return values;
    }

    function getUniqueValuesTwo(values) {
      var tempUniqueValues = [];
      values.forEach(function(item, i) {
        if (
          (tempUniqueValues.length < 1 || tempUniqueValues.indexOf(item) === -1) &&
          item !== ""
        ) {
          tempUniqueValues.push(item);
        }
      });

      //let removeValues = ['ADJACENT DESIGNATED NR LANDMARK','ADJACENT NR HISTORIC DISRTICT','ADJACENT POTENTIAL NR HIST. DIST','ADJACENT POTENTIAL NR LANDMARK','ADJACENT PROPERTY W/IN NR HD','BUILDING NEAR HISTORIC DISTRICT','NO INTEREST','PROJECT NEAR SIGNIFICANT BLDGS.','SIGNIFICANCE NOT DETERMINED','SIGNIFICANT BUT UNELIGIBLE'];
      let removeValues = ['NA'];
      let uniqueValues = tempUniqueValues.filter(item => !removeValues.includes(item));

      return uniqueValues;
    }

    function addToSelectTwo(values) {
      values.sort();
      values.forEach(function(value) {
        var option = document.createElement("option");
        option.text = `'${value}'`;
        option.label = value;
        fedFilter.selectize.addOption(option);
      });
    }

    /*********
     * 
     * 
     * Start of General Query Code
     * 
     * 
     * **********/

    document.getElementById("doBtnCcd").addEventListener("click", doQueryCcd);
    document.getElementById("doBtnOne").addEventListener("click", doQueryOne);
    document.getElementById("doBtnTwo").addEventListener("click", doQueryTwo);
    document.getElementById("doBtnThree").addEventListener("click", doQueryThree);

    /*******
     * 
     * Query One: select ERGIS points by PUID
     * 
     * *******/

    const fieldOne = "PUID";
    const operator = "=";
    const puidVal = document.getElementById("puidSelect");

    function doQueryOne() {
      resultsLayerPUID.removeAll();
      params.where = "COUNDIST IN (" + ccdVar + ") AND " + fieldOne + operator + puidVal.value;
      console.log(params.where)
      query.executeQueryJSON(ergisUrl, params).then(getResults).catch(promiseRejected);
    }

    function getResults(response) {
      const ergisResults = response.features.map(function(feature) {
        /*feature.symbol = {
          type: "simple-marker",
          size: 10,
          color: [226, 123, 123, 0.85]
        };*/
        return feature;
      })
      selectPUIDTaxLots(ergisResults);
    }

    function selectPUIDTaxLots(ergisPoints) {
      resultsLayerPUID.removeAll();
      for(var i=0; i<ergisPoints.length; i++) {
        a1(ergisPoints[i]).then(a2)
      }
    }

    function a1(p) {
    var query = taxLots.createQuery();
    query.returnGeometry = true;
    query.geometry = p["geometry"];
    query.spatialRelationship = "intersects";
    return taxLots.queryFeatures(query);
    }

    function a2(p) {
    const lotResults = p.features.map(function (feature) {
        feature.symbol = {
        type: "simple-fill",
        color: [0, 0, 0, 1],
        style: "diagonal-cross",
        width: 3,
        //size: "10px",
        outline: {
            color: [0, 0, 0, 1],
            width: 1.5
        }
        };
        return feature
    })
    resultsLayerPUID.addMany(lotResults);
    document.getElementById("puidVis").style.display="flex" 
    //view.goTo(resultsLayerPUID.graphics); 
    }

    /******
     * 
     * Query Two: select LPC Impact points
     * 
     * ******/

    let lpcImpactValue;

    let selectedLpcImpact = null;

    const updateLpcFilter = function() {
      let conditions = [];
      if (selectedLpcImpact) {
        conditions.push(`${selectedLpcImpact}`);
      }
      joinedConditions = conditions.join(", ")
      lpcImpactValue = joinedConditions;
    }

    /*click event handler for multi-select*/

    $('#lpcFilter').change(function(){
      selectedLpcImpact = $(this).val();
      updateLpcFilter();
    })

    function doQueryTwo() {
      resultsLayerLPC.removeAll();
      paramsTwo.where = "COUNDIST IN (" + ccdVar + ") AND LPCIMPTWO IN (" + lpcImpactValue + ")";
      console.log(paramsTwo.where);
      query.executeQueryJSON(ergisUrl, paramsTwo).then(getResultsTwo).catch(promiseRejected);
    }

    function getResultsTwo(response) {
      const ergisResults = response.features.map(function(feature) {
        return feature;
      })
      //resultsLayer.addMany(ergisResults); //temp add points layer
      selectLPCTaxLots(ergisResults);
    }

    function selectLPCTaxLots(ergisPoints) {
      resultsLayerLPC.removeAll();
      for(var i=0; i<ergisPoints.length; i++) {
        b1(ergisPoints[i]).then(b2)
      }
    }

    function b1(p) {
    var query = taxLots.createQuery();
    query.returnGeometry = true;
    query.geometry = p["geometry"];
    query.spatialRelationship = "intersects";
    return taxLots.queryFeatures(query);
    }

    function b2(p) {
    const lotResults = p.features.map(function (feature) {
        feature.symbol = {
        type: "simple-fill",
        style: "solid",
        color: [37, 227, 245, 0.5],
        size: "10px",
        outline: {
            color: [0, 156, 171, 0.7],
            width: 1
        }
        };
        return feature
    })
    resultsLayerLPC.addMany(lotResults);
    document.getElementById("lpcVis").style.display="flex" 
    //view.goTo(resultsLayer.graphics); 
    }

    /******
     * 
     * Query Three: select FED Impact points
     * 
     * ******/

    let fedImpactValue;

    let selectedFedImpact = null;
    const updateFedFilter = function() {
      let conditions = [];
      if (selectedFedImpact) {
        conditions.push(`${selectedFedImpact}`);
      }
      joinedConditions = conditions.join(", ")
      fedImpactValue = joinedConditions;
    }

    /* click event handler for multi-select*/

    $('#fedFilter').change(function(){
      selectedFedImpact = $(this).val();
      updateFedFilter();
    })

    function doQueryThree() {
      resultsLayerFED.removeAll();
      paramsThree.where = "COUNDIST IN (" + ccdVar + ") AND FEDIMPTWO IN (" + fedImpactValue + ")";
      console.log(fedImpactValue);
      query.executeQueryJSON(ergisUrl, paramsThree).then(getResultsThree).catch(promiseRejected);
    }

    function getResultsThree(response) {
      const ergisResults = response.features.map(function(feature) {
        return feature;
      })
      selectFEDTaxLots(ergisResults);
    }

    function selectFEDTaxLots(ergisPoints) {
        resultsLayerFED.removeAll();
        for(var i=0; i<ergisPoints.length; i++) {
          c1(ergisPoints[i]).then(c2)
        }
      }
  
    function c1(p) {
    var query = taxLots.createQuery();
    query.returnGeometry = true;
    query.geometry = p["geometry"];
    query.spatialRelationship = "intersects";
    return taxLots.queryFeatures(query);
    }

    function c2(p) {
    const lotResults = p.features.map(function (feature) {
        feature.symbol = {
        type: "simple-fill",
        style: "solid",
        color: [255, 255, 255, 0],
        size: "10px",
        outline: {
            color: [196, 16, 16, 1],
            width: 1.5
          }
        };
        return feature
    })
    resultsLayerFED.addMany(lotResults);
    document.getElementById("fedVis").style.display="flex" 
    //view.goTo(resultsLayer.graphics); 
    }
    
    /*********Initialize Selectize.js Mult-Select Dropdowns*********/

    const $select = $("#ccdFilter").selectize({
        closeAfterSelect: true,
        render: {
            option: function(item, escape) {
            return '<div> Council District ' + item.label + ' </div>';
            }
        },
        plugins: ['remove_button']
    });

    $("#lpcFilter").selectize({
        closeAfterSelect: true,
        render: {
            option: function(item, escape) {
            return '<div> ' + item.label + ' </div>';
            }
        },
        plugins: ['remove_button']
    });

    $("#fedFilter").selectize({
        closeAfterSelect: true,
        render: {
            option: function(item, escape) {
            return '<div> ' + item.label + ' </div>';
            }
        },
        plugins: ['remove_button']
    });

    /*********Mult-Select Clear Buttons*********/

    $("#cancelBtnCcd").click(function () {
        resultsLayerPUID.removeAll();
        resultsLayerFED.removeAll();
        resultsLayerLPC.removeAll();
        taxLots.definitionExpression = "Council = '01'";

        //Clear selectize filter
        var selectize = $select[0].selectize;
        selectize.clear();
        selectize.setValue(selectize.search("01").items[0].id);

        //Remove items from legend
        document.getElementById("puidVis").style.display="none"
        document.getElementById("lpcVis").style.display="none"
        document.getElementById("fedVis").style.display="none"

        //Zoom to Council District 01
        taxLots.queryExtent().then((results) => {
          view.goTo({
            target: results.extent,
            duration: 500
          })
        })
    });

    $("#cancelBtnOne").click(function cancelPUID() {
        resultsLayerPUID.removeAll();
        document.getElementById('puidSelect').value = ''
        document.getElementById("puidVis").style.display="none"
    });

    $("#cancelBtnTwo").click(function cancelLPC() {
        resultsLayerLPC.removeAll();
        const lpcSelect = $('#lpcFilter')[0].selectize;
        lpcSelect.clear(true);
        document.getElementById("lpcVis").style.display="none"
    });

    $("#cancelBtnThree").click(function cancelFED() {
        resultsLayerFED.removeAll();
        const fedSelect = $('#fedFilter')[0].selectize;
        fedSelect.clear(true);
        document.getElementById("fedVis").style.display="none"
    });

    /*********Major Project Filter*********/

    const projFilt = document.getElementById("projFilter");

    projFilt.addEventListener("change", function(event) {
        const newValue = event.target.value;
        const whereClause = newValue
            ? "PROJECT_NA = '" + newValue + "'"
            : null;
            dcpStudyAreas.definitionExpression = whereClause;
            dcpStudyAreasBuff.definitionExpression = whereClause;
      
    });

    /*********CCD Filter*********/

    let ccdValue;

    let selectedCcd = null;
    const updateCcdFilter = function() {
      let conditions = [];
      let ccdVarConditions = [];
      if (selectedCcd) {
        conditions.push(`${selectedCcd}`);
        ccdVarConditions.push(`${selectedCcd}`);
      }
      joinedConditions = conditions.join(", ")
      ccdValue = joinedConditions;

      //Send values to PUID, LPC & FED filter condition arrays
      joinedCcdVarConditions = ccdVarConditions.join(",");
      ccdVar = joinedCcdVarConditions;
    }

    /* click event handler for multi-select*/

    $('#ccdFilter').change(function(){
      selectedCcd = $(this).val();
      updateCcdFilter();
    })

    function doQueryCcd() {
      taxLots.definitionExpression = "Council IN (" + ccdValue + ")";
      taxLots.queryExtent().then((results) => {
        view.goTo({
          target: results.extent,
          duration: 500
        })
      });
      
      //Reset all filters and legend

      resultsLayerPUID.removeAll();
      document.getElementById('puidSelect').value = ''
      document.getElementById("puidVis").style.display="none"

      resultsLayerLPC.removeAll();  
      const lpcSelect = $('#lpcFilter')[0].selectize;
      lpcSelect.clear(true);
      document.getElementById("lpcVis").style.display="none"

      resultsLayerFED.removeAll();
      const fedSelect = $('#fedFilter')[0].selectize;
      fedSelect.clear(true);
      document.getElementById("fedVis").style.display="none"

    }
    

    /*********LPC Designations Layer ON/OFF Swtich*********/

    var lpcLayerButton = document.getElementById("lpcLayerButton");

    let lpcLayerFlag = 0;
    lpcLayerButton.addEventListener("click", function() {
        if (lpcLayerFlag == 0) {
            lpcHd.visible = true;
            lpcInd.visible = true;
            lpcSce.visible = true;
            lpcInt.visible = true;
            lpcLayerFlag = 1;
            document.getElementById("ilVis").style.display="flex"
            document.getElementById("intVis").style.display="flex"
            document.getElementById("hdVis").style.display="flex"
            document.getElementById("sceVis").style.display="flex"
        } else {
            lpcHd.visible = false;
            lpcInd.visible = false;
            lpcSce.visible = false;
            lpcInt.visible = false;
            lpcLayerFlag = 0;
            document.getElementById("ilVis").style.display="none"
            document.getElementById("intVis").style.display="none"
            document.getElementById("hdVis").style.display="none"
            document.getElementById("sceVis").style.display="none"
        }
    });

    /*********LPC Designations Labeling ON/OFF Swtich*********/

    /*var lpcLabelButton = document.getElementById("lpcLabelButton");

    let lpcLabelFlag = 0;
    lpcLabelButton.addEventListener("click", function() {
        if (lpcLabelFlag == 0) {
            lpcHd.labelsVisible = true;
            lpcInd.labelsVisible = true;
            lpcSce.labelsVisible = true;
            lpcInt.labelsVisible = true;
            lpcLabelFlag = 1;
        } else {
            lpcHd.labelsVisible = false;
            lpcInd.labelsVisible = false;
            lpcSce.labelsVisible = false;
            lpcInt.labelsVisible = false;
            lpcLabelFlag = 0;
        }
    });*/

    /*********LPC Designations Layer ON/OFF Swtich*********/

    var ccdLayerButton = document.getElementById("ccdLayerButton");

    let ccdLayerFlag = 1;
    ccdLayerButton.addEventListener("click", function() {
        if (ccdLayerFlag == 0) {
            ccdBoundaries.visible = true;
            ccdLayerFlag = 1;
            document.getElementById("ccdVis").style.display="flex"
        } else {
            ccdBoundaries.visible = false;
            ccdLayerFlag = 0;
            document.getElementById("ccdVis").style.display="none"
        }
    });


    /*********Major Projects Layer ON/OFF Swtich*********/

    var projLayerButton = document.getElementById("projlayerButton");

    let projLayerFlag = 1;
    projLayerButton.addEventListener("click", function() {
        if (projLayerFlag == 1) {
            dcpStudyAreas.visible = true;
            dcpStudyAreasBuff.visible = true;
            projLayerFlag = 0;
            document.getElementById("projVis").style.display="flex"
            document.getElementById("projBuffVis").style.display="flex"
            document.getElementById("projFilterHolder").style.display="block"
        } else {
            dcpStudyAreas.visible = false;
            dcpStudyAreasBuff.visible = false;
            projLayerFlag = 1;
            document.getElementById("projVis").style.display="none"
            document.getElementById("projBuffVis").style.display="none"
            document.getElementById("projFilterHolder").style.display="none"
        }
    });

    /*********Search Widget**********/

    const searchButton = document.getElementById("toggleSearch");
    let state = 1;
    searchButton.addEventListener("click", function() {
      
      if (state == 0) {
        addSearch.sources = address;
        $("#searchText").html("Find an Address");
        addSearch.clear();
        state = 1;
      } else {
        addSearch.popupEnabled = true;
        addSearch.sources = bblSearch;
        $("#searchText").html("Find a BBL");
        addSearch.clear();
        state = 0;
      }
    });

    const address = [{
        url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
        singleLineFieldName: "SingleLine",
        outFields: ["Addr_type"],
        name: "ArcGIS World Geocoding Service",
        placeholder: "Enter an Address",
        resultSymbol: {
            type: "simple-marker",  
            style: "circle",
            color: "#FFF",
            size: 18, 
            outline: { 
            color: "#000",
            width: 4 
            }
        }
    }];
        
    const bblSearch = [{
        layer: taxLots,
        searchFields: ["BBL"],
        displayField: "BBL",
        exactMatch: false,
        outFields: ["BBL", "Address"],
        name: "Tax Lot Search",
        placeholder: "Enter a BBL Number"
    }];

    const addSearch = new Search({
        view: view,
        includeDefaultSources: false,
        container: "addSearch",
        locationEnabled: false,
        outFields: ["Addr_Type"],
        allPlaceholder: "Enter an Address",
        popupEnabled: false,
        sources: address
    });   
        
    /******Legend Toggle Switch*******/

    let menuToggle = 0;

    $(document).ready(function(){
        $("#toggle").click(function(){
            $("#legendDiv").fadeToggle(500);
            if (menuToggle == 0) {
              document.getElementById("menu").style.boxShadow="none"
              menuToggle = 1;
            } else {
              document.getElementById("menu").style.boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
              menuToggle = 0;
            }
        })
    })



  });