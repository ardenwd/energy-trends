//make a new svg attached to the #data-centers-vis
//rollup the csv data into an array - one for low and one for high projection
//establish color pallette
//make axes
//add data
//add text context

const width = 670;
const height = 300;
const margin = { top: 20, right: 30, bottom: 20, left: 80 };

// Add a custom tooltip (HTML element)
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid #000")
  .style("padding", "5px")
  // .style("border-radius", "5px")
  .style("pointer-events", "none")
  .style("opacity", 0)
  .style("transition", "opacity 0.1s ease 0.3s"); // Smooth transition for opacity change;
// Initially hidden

// Function to handle hover and leave events for categories dynamically
function categoriesHover(categoryNames, baseClassName) {
  categoryNames.forEach((categoryName, index) => {
    const categoryId = `${baseClassName}-${index}`; // Using baseClassName dynamically
    const categoryClass = `${baseClassName}-${index}`;

    // Select all elements with the class corresponding to this category
    const categoryElements = document.querySelectorAll(`.${categoryClass}`);
    // Apply transition to all category elements
    categoryElements.forEach((element) => {
      element.style.transition = "opacity 0.3s ease"; // Smooth transition for opacity change
    });
    // Select the element with the matching ID for this category
    const categoryIdElement = document.getElementById(categoryId);

    // Set up the hover event listeners for each categoryIdElement
    categoryIdElement.addEventListener("mouseenter", function () {
      // On hover, set opacity 0 for the other categories
      categoryNames.forEach((_, i) => {
        if (i !== index) {
          // Only hide the categories that are not being hovered
          const otherCategoryElements = document.querySelectorAll(
            `.${baseClassName}-${i}`
          );
          otherCategoryElements.forEach((el) => (el.style.opacity = "0.2"));
        }
      });
    });

    categoryIdElement.addEventListener("mouseleave", function () {
      // On mouse leave, reset opacity to 1 for all categories
      categoryNames.forEach((_, i) => {
        const allCategoryElements = document.querySelectorAll(
          `.${baseClassName}-${i}`
        );
        allCategoryElements.forEach((el) => (el.style.opacity = "1"));
      });
    });
  });
}

const colorScheme = ["#c6a5f3", "#ff9772", "#ffc862", "#5dc1b7"];
const categoriesColors = [
  "#6BD2FF",
  "#4E78DC",
  "#82F487",
  "#40ADA2",
  "#FCF500",
  "#F6B800",
  "#F37633",
  "#AF85F8",
  "#A969B6",
  //gray
  "#bbb",
  //repeat
  "#F37633",
  "#AF85F8",
  "#A969B6",
  "#F37633",
  "#AF85F8",
  "#A969B6",
];

//data center vis
d3.csv("data-centers.csv").then(function (dataset) {
  // const type = ["Historical", "Historical", "Projected Low", "Projected High"];
  const fillScheme = ["#ffd784", "#ffd784", "#ffad8f", "#ff9772"];

  const dataCategories = {
    0: { color: "#7C5305", label: "Historical Value" },
    1: { color: "#7C5305", label: "Historical Value" },
    2: { color: "#ffad8f", label: "Projected Low" },
    3: { color: "#ff9772", label: "Projected High" },
  };

  let low = dataset.map((d) => ({
    year: d.year, // Extract the 'year' column
    val: d.val_low, // Extract the 'val_low' column
  }));

  let high = dataset.map((d) => ({
    year: d.year, // Extract the 'year' column
    val: d.val_high, // Extract the 'val_low' column
  }));
  var i = 0;
  let percents = dataset.flatMap((d) => {
    let entries = [];
    if (d.per) {
      entries.push({
        year: d.year,
        per: d.per,
        val: d.val_low,
        type: d.type,
        i: i++,
      });
    }
    if (d.per_high) {
      entries.push({
        year: d.year,
        per: d.per_high,
        val: d.val_high,
        type: "Projected High",
        i: i++,
      });
    }
    return entries;
  });

  // Define scales
  const xScale = d3.scaleLinear().domain([2014, 2028]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 600]).range([height, 20]);

  var vis = d3
    .select("#data-centers-vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Call the reusable function
  createAxes(vis, xScale, yScale, width, height, {
    xTicks: 7,
    yTicks: 4,
    margin,
    yHidden: true,
    xTickSize: "0",
    yTickSize: "0",
    yGrid: true,
    yTickValues: [61, 177, 581],
    yTickUnit: " TWh",
  });

  // // extra y axis on right side
  // const yAxis = d3
  //   .axisLeft(yScale)
  //   .tickSize(0)
  //   .tickValues([61, 177, 325, 581])
  //   .tickFormat((d) => d3.format(".1f")(d / 581) + "%");

  // var yAxisGroup = vis.append("g").call(yAxis);

  // // Apply font style to all tick text
  // yAxisGroup
  //   .selectAll("text")
  //   .style("fill", "#aaaaaa")
  //   .style("font-size", "0.7rem")
  //   .attr("transform", "translate(675,0)");

  // yAxisGroup.select(".domain").style("stroke-width", "0");

  // Optional: Add a line connecting the points (Line Chart)
  var line = d3
    .line()
    .x((d) => xScale(d.year)) // X position (scaled)
    .y((d) => yScale(d.val)); // Y position (scaled)

  vis
    .append("path")
    .datum(low) // Bind data to the line
    .attr("d", line) // Use line generator
    .attr("fill", "none") // No fill for the line
    .attr("stroke", "#000") // Line color
    .attr("stroke-width", 0.5); // Line thickness

  vis
    .append("path")
    .datum(high) // Bind data to the line
    .attr("d", line) // Use line generator
    .attr("fill", "none") // No fill for the line
    .attr("stroke", "#000") // Line color
    .attr("stroke-width", 0.5); // Line thickness

  // TOP PATH
  // Define an area generator
  var area = d3
    .area()
    .x((d, i) => xScale(low[i].year)) // Use year from low for X-axis
    .y0((d, i) => yScale(low[i].val)) // Bottom line from low array
    .y1((d, i) => yScale(high[i].val)); // Top line from high array

  // Append the area path
  vis
    .append("path")
    .datum(low) // Bind data to the area
    .attr("d", area) // Use the area generator
    .attr("fill", "#ff9772") // Area fill color
    .attr("opacity", 1); // Optional: Make the fill semi-transparent

  area = d3
    .area()
    .x((d, i) => xScale(low[i].year)) // Use year from low for X-axis
    .y0((d, i) => height) // Bottom line from low array
    .y1((d, i) => yScale(low[i].val)); // Top line from high array

  // Append the area path
  //RIGHT (FULL) BOTTOM PATH
  vis
    .append("path")
    .datum(low) // Bind data to the area
    .attr("d", area) // Use the area generator
    .attr("fill", "#ffad8f") // Area fill color
    .attr("opacity", 1); // Optional: Make the fill semi-transparent

  const filteredData = low.filter((d) => d.year >= 2014 && d.year <= 2023);
  area = d3
    .area()
    .x((d, i) => xScale(low[i].year)) // Use year from low for X-axis
    .y0((d, i) => height) // Bottom line from low array
    .y1((d, i) => yScale(low[i].val)); // Top line from high array

  // LEFT BOTTOM PATH
  vis
    .append("path")
    .datum(filteredData) // Bind data to the area
    .attr("d", area) // Use the area generator
    .attr("fill", "#ffd784") // Area fill color
    .attr("opacity", 1); // Optional: Make the fill semi-transparent

  vis
    .append("text")
    .style("font-size", "0.8rem")
    .text("projected high →")
    .style("fill", "#AC5536")
    .attr("transform", `translate(454,106)`);

  vis
    .append("text")
    .style("font-size", "0.8rem")
    .text("projected low")
    .style("fill", "#fff")
    .attr("transform", `translate(508,250)`);

  vis
    .append("text")
    .style("font-size", "0.8rem")
    .text("← historical →")
    .style("fill", "#7C5305")
    .attr("transform", `translate(150,290)`);

  //add 4 data points
  //tool tip below
  vis
    .selectAll(".dot")
    .data(percents) // Use selected data from `low`
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d.year)) // Position dots based on `year`
    .attr("cy", (d) => yScale(d.val)) // Position dots based on `val` from `low`
    .attr("r", 6) // Dot radius
    .attr("fill", (d, i) => fillScheme[i]) // Dot color for `low`
    .attr("stroke", "#000") //
    .attr("stroke-width", 0.5) // Line width
    .on("mouseover", function (event, d) {
      d3.select("#tooltip")
        .style("opacity", 1)
        .style("transition", "opacity 0.1s ease")
        .html(
          `
  <text style="font-size: 0.7rem;">${d.year}</text>
  <text style="font-size: 0.7rem; color: ${
    dataCategories[d.i].color
  };  margin-top: 4px;">
    ${d.type}
  </text>
  <div style="font-size: 14px; font-weight: bold; margin-top: 2px; font-size: 0.8rem">
    ${
      d.per
    }% <text style="font-weight: normal;font-size: 0.7rem"> of US Total </text>
  </div>
`
        )
        .style("left", event.pageX + 14 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function () {
      d3.select("#tooltip")
        .style("opacity", 0)
        .style("transition", "opacity 0.1s ease 0.3s");
    });
});

//clean energy vis
d3.csv("clean-energy-net-change.csv").then(function (dataset) {
  let ceData = dataset.map((d) => ({
    year: +d.Year,
    Wind: +d.Wind,
    Solar: +d.Solar,
    Other: +d.Other,
  }));
  const keys = ["Wind", "Solar", "Other"];
  const keysDescription = [
    " ",
    " ",
    "(Waste biomass, Wood biomass, Pumped storage hydroelectric, Geothermal, Conventional Hydroelectric)",
  ];

  // Determine the series that need to be stacked.
  const stack = d3.stack().keys(keys);
  const stackedData = stack(ceData);
  stackedData.forEach((stackArray, index) => {
    // Each element in stackArray is [start, end]
    stackArray.forEach((d, i) => {
      d.key = index;
    });
  });

  // Define scales
  const xScale = d3.scaleLinear().domain([2011, 2025]).range([0, width]);
  const yScale = d3.scaleLinear().domain([-4, 60]).range([height, 20]);

  const visID = "clean-vis";
  var svg = d3
    .select(`#` + visID)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  var vis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const base = "cats";
  makeLegend(visID, keys, keysDescription, categoriesColors, base);

  // Call the reusable function
  createAxes(vis, xScale, yScale, width, height, {
    xTicks: 7,
    yTicks: 4,
    margin,
    yHidden: true,
    xTickSize: "0",
    yTickSize: "0",
    yGrid: true,
    // yTickValues: [61, 177, 581],
    yTickUnit: " gW",
  });

  var key;
  var rectHov;

  vis
    .selectAll(".layer")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "layer")
    .attr("fill", function (d, i) {
      return categoriesColors[i];
    })
    .selectAll("rect")
    .data(function (d, i) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("class", function (d) {
      return base + "-" + d.key;
    })
    .attr("x", function (d, i) {
      return xScale(d.data.year);
    })
    // .attr("y", (d) => yScale(Math.max(0, d.count)))
    .attr("y", function (d, i) {
      console.log("d", d);
      if (d[0] > d[1]) {
        return yScale(0) + 1;
        // }
      }
      return Math.abs(yScale(d[0])) - Math.abs(yScale(d[0]) - yScale(d[1]));
      // return yScale(0) - Math.abs(yScale(d[0]) - yScale(d[1]));
    })
    .attr("height", function (d) {
      if (d[0] > d[1]) {
        return yScale(d.data.Other) - yScale(0);
      }
      // index++;
      return Math.abs(yScale(d[0]) - yScale(d[1]));
    }) // Height based on value range
    .attr("width", 40)
    .on("mouseover", function (event, d) {
      d3.select(this).classed("rect-hovered", true); // Remove the class
      d3.select("#tooltip")
        .style("opacity", 1)
        .style("transition", "opacity 0.1s ease")
        .html(
          ` 
  <div> <text style="font-size: 0.7rem;">${d.data.year}</text></div>
  <div style="display:flex; align-items:center"><span class="tooltip-dot" style="background-color:${
    categoriesColors[d.key]
  };"></span><text style=" margin-top: 2px; font-size: 0.8rem;"> ${
            keys[d.key]
          }:  <tspan style="font-weight: bold;">${
            d.data[keys[d.key]]
          }  <tspan style="font-size:0.8em" >gW</tspan></tspan></text></div>
`
        )
        .style("left", event.pageX + 14 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function (event) {
      d3.select(".rect-hovered").classed("rect-hovered", false); // Remove the class
      d3.select("#tooltip")
        .style("opacity", 0)
        .style("transition", "opacity 0.1s ease 0.3s");
    });

  categoriesHover(keys, base);
});

//clean demand vis

d3.csv("energy-usage.csv").then(function (dataset) {
  const buttonNR = document.getElementById("button-nr");
  buttonNR.classList.toggle("hide");

  buttonNR.addEventListener("click", () => {
    // Toggle the "show" class
    buttonNR.classList.toggle("hide");
    updateCleanDemandVis(dataset, buttonNR);
  });

  updateCleanDemandVis(dataset, buttonNR);
});

function updateCleanDemandVis(dataset, buttonNR) {
  var set = dataset.filter((d) => d.Year > 2012);

  set.forEach((item) => {
    delete item.Total;
  });

  //exclude year
  const filteredEnergyData = dataset.columns.slice(1);
  // Filter the array to exclude the total
  var typeKeys = filteredEnergyData.splice(2);
  //put not renewables at the bottom

  typeKeys.push(typeKeys.splice(0, 1)[0]);

  console.log(typeKeys);

  var xScale;
  var yScale;
  // Change the text to "hide" or "show" depending on the current state
  if (buttonNR.classList.contains("hide")) {
    buttonNR.textContent = "Hide Non-Renewables";
    typeKeys = typeKeys.filter((item) => item !== "Non-Renewables");
    yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);
  } else {
    buttonNR.textContent = "Show Non-Renewables";

    yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  }

  const yearKeys = set.map((d) => d.Year);
  xScale = d3
    .scaleLinear()
    .domain([2013, 2025])
    .range([0 + 10, width - 20]);

  // stack the data
  const stack = d3
    .stack()
    .keys(typeKeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);
  const stackedData = stack(set);

  const base = "cat";
  const visID = "clean-demand-vis";
  d3.select(`.` + visID + `-block`).remove();
  var svg = d3
    .select(`#` + visID)
    .append("svg")
    .attr("class", visID + `-block`)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 10);
  var vis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Call the reusable function
  createAxes(vis, xScale, yScale, width, height, {
    // xTicks: 9,
    yTicks: 4,
    margin,
    yHidden: true,
    // xTickSize: "0",
    yTickSize: "0",
    yGrid: true,
    // xTickValues: [2013, 2015, 2017, 2019, 2021, 2023, 2025],
    yTickUnit: " gW",
  });

  makeLegend(visID, typeKeys, "", categoriesColors, base);
  categoriesHover(typeKeys, base);

  var hoverArea = vis
    .append("g")
    .attr("class", visID + "-hover-area")
    .selectAll("g")
    .data(stackedData)
    .join("path")
    .attr("fill", function (d) {
      return categoriesColors[d.index];
    })
    .attr(
      "d",
      d3
        .area()
        .x((d) => {
          // console.log("X value for year:", d.data.Year);
          return xScale(d.data.Year);
        })
        .y0((d) => {
          // console.log("Y0 value:", d[0]);
          return isNaN(d[0]) ? 0 : yScale(d[0]);
        })
        .y1((d) => {
          // console.log("Y1 value:", d[1]);
          return isNaN(d[1]) ? 0 : yScale(d[1]);
        })
    )
    .attr("stroke", "#000") // Line color
    .attr("stroke-width", 0.5) // Line thickness
    .attr("class", function (d) {
      return base + "-" + d.index;
    })
    .attr("width", 100)
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .on("mousemove", (event, d) =>
      createTooltip(
        event,
        d,
        typeKeys,
        hoverArea,
        categoriesColors,
        visID,
        stackedData,
        {
          calcX: true, // Ensure this is true as expected
          xScale: xScale,
          yScale: yScale,
          showAll: true,
          xIndex: yearKeys,
          unitString: "gW",
        }
      )
    )
    .on("mouseout", function () {
      removeTooltip();
    });
  //tooltip
}

function roundYear(value, yearRange) {
  const closestYear = yearRange.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });

  // Step 2: Get the index of the closest value
  const closestIndex = yearRange.indexOf(closestYear);

  return closestIndex;
}

function mapMouseToIndex(SVGElement, MoveMouseEvent, yearKeys, xScale) {
  const svg = SVGElement.node();
  let svg_element_position = svg.getBoundingClientRect();

  coords = {
    x: Math.round(MoveMouseEvent.clientX - svg_element_position.x),
    y: Math.round(MoveMouseEvent.clientY - svg_element_position.y),
  };

  //calculate value
  const xValue = xScale.invert(coords.x);

  const yearIndex = roundYear(xValue, yearKeys);
  const xPos = xScale(yearKeys[yearIndex]);

  // const xPos = svg_element_position.x + xScale(yearKeys[yearIndex]) - 10;
  const yPos = svg_element_position.y;
  //calculate edge of svg

  return { yearIndex: yearIndex, xPos: xPos, yPos: yPos };
}

function makeLegend(
  visID,
  categories,
  categoriesDescription,
  colors,
  baseClassName
) {
  d3.select(`.legend-container${visID}`).remove();

  //attach legend
  d3
    .select(`#` + visID) // Adjust to your container element
    .append("div")
    .attr("class", `legend-container${visID}`)
    // .attr("class", "legend-container")
    .style("font-family", "Arial, sans-serif")
    .style("text-align", "left")
    .style("line-height", "1.4")
    .style("margin-top", "10px")
    .html(`<div style="width: 90%; height: 1px; background-color: #ddd; margin: auto;"></div>
  <div style="display: flex; padding: 0 30px;">
    <div style="display: flex; gap-right: 26px; align-items: center; margin-right: auto; display: flex; flex-wrap: wrap;">`);

  categories.forEach((category, index) => {
    const catDes = categoriesDescription[index]
      ? categoriesDescription[index]
      : "";

    d3
      .select(`.legend-container${visID} >div >div`)
      // .select(".legend-container >div >div")
      .append("div")
      .attr("id", baseClassName + `-${index}`)
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-top", "5px").html(`
      <span class="tooltip-dot legend-dot" style="background-color:${colors[index]};"></span>
      <span style="max-width:450px; font-size: 0.8rem;"><tspan style="font-weight: bold;">${category}</tspan> ${catDes}</span>
    `);
  });
  d3.select(`.legend-container${visID}`)
    // .select("legend-container")
    .append("div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("margin-top", "20px")
    .html("</div>");
}

function createTooltip(
  event,
  d,
  categories,
  vis,
  colors,
  visID,
  dataset,
  options = {}
) {
  // Default configuration
  const config = {
    calcX: options.calcX || false,
    xScale: options.xScale || "",
    yScale: options.yScale || "",
    showAll: options.showAll || false,
    xIndex: options.xIndex || "",
    unitString: options.unitString || "m",
    line: options.line || false,
  };

  //show all
  if (config.showAll) {
    //calculate the xIndex
    var index = 0;
    var xPos = 0;
    if (config.calcX) {
      index = mapMouseToIndex(
        vis,
        event,
        config.xIndex,
        config.xScale
      ).yearIndex;
      xPos = mapMouseToIndex(vis, event, config.xIndex, config.xScale).xPos;
    }

    d3.select("#tooltip")
      .style("opacity", 1)
      .style("transition", "opacity 0.1s ease")
      .html(
        `
        <text style="font-size: 0.7rem; font-weight: bold; margin-left: 10px">${d[index].data.Year}</text>
        `
      )
      .style("left", event.pageX + 14 + "px")
      .style("top", event.pageY - 20 + "px");

    d3.selectAll(`.tooltip-hover-dot`)
      .style("opacity", 0)
      .style("transition", "opacity 0.1s ease")
      .remove();

    categories.forEach((category, i) => {
      // .style("margin-top", "5px")
      d3
        .select("#tooltip")
        // .select(".legend-container >div >div")
        .append("div")
        .style("display", "flex")
        .style("height", "20px")
        .style("align-items", "center").html(`
      <span class="tooltip-dot legend-dot" style="background-color:${colors[i]};"></span>
      <span style="max-width:450px; font-size: 0.5rem;">${category}: <tspan style="font-weight: bold;">${d[index].data[category]} ${config.unitString} </tspan> </span>
`);

      const dotContainer = d3.select(`.${visID}-hover-area`);
      dotContainer
        .append("circle")
        .attr("class", `tooltip-hover-dot`)
        .attr("cx", xPos + 0.5) // Position dots based on `year`
        .attr("cy", config.yScale(dataset[i][index][1])) // Position dots based on `val` from `low`
        .attr("r", 9) // Dot radius
        .attr("fill", colors[i]) // Dot color for `low`
        .attr("opacity", "0.5")
        .attr("stroke-width", 0.5);
      dotContainer
        .append("circle")
        .attr("class", `tooltip-hover-dot`)
        .attr("cx", xPos + 0.5) // Position dots based on `year`
        .attr("cy", config.yScale(dataset[i][index][1])) // Position dots based on `val` from `low`
        .attr("r", 9) // Dot radius
        .attr("fill", "#fff") // Dot color for `low`
        .attr("opacity", "0.3")
        .attr("stroke-width", 0.5);
      dotContainer
        .append("circle")
        .attr("class", `tooltip-hover-dot`)
        .attr("cx", xPos + 0.5) // Position dots based on `year`
        .attr("cy", config.yScale(dataset[i][index][1])) // Position dots based on `val` from `low`
        .attr("r", 6) // Dot radius
        .attr("fill", colors[i]) // Dot color for `low`
        .attr("stroke", "#000") //
        .attr("stroke-width", 0.5);
    });

    //yScale(d[0])
  } else {
    d3.select("#tooltip")
      .style("opacity", 1)
      .style("transition", "opacity 0.1s ease")
      .html(
        `
  <text style="font-size: 0.7rem;">${d.year}</text>
  <text style="font-size: 0.7rem; color: #f357d1;  margin-top: 4px;">
    ${d.type}
  </text>
  <div style="font-size: 14px; font-weight: bold; margin-top: 2px; font-size: 0.8rem">
    ${d.per}% <text style="font-weight: normal;font-size: 0.7rem"> of US Total </text>
  </div>
`
      )
      .style("left", event.pageX + 14 + "px")
      .style("top", event.pageY - 20 + "px");
  }

  if (config.line) {
    d3.select("#tooltip-line")
      .style("opacity", 0)
      .style("transition", "opacity 0.1s ease")
      .remove();
    // vis.append("line");
    d3.select(`.` + visID + `-hover-area`)
      .append("line")
      .attr("id", "tooltip-line")
      .attr("x1", xPos + 0.5)
      .attr("x2", xPos + 0.5)
      // Starting X position (at the Y-axis)
      .attr("y1", 0) // Y position for each tick (using the scale)
      .attr("y2", height)
      // .attr("y2", (d) => yScale(d)) // Y position for each tick (same as y1)
      .attr("stroke", "#000") // Grid line color (light gray)
      .attr("stroke-width", 1); // Line width
  }
}

function removeTooltip() {
  d3.select("#tooltip")
    .style("opacity", 0)
    .style("transition", "opacity 0.1s ease 0.2s");

  d3.selectAll(`.tooltip-hover-dot`)
    .style("opacity", 0)
    .style("transition", "opacity 0.1s ease")
    .remove();

  d3.select("#tooltip-line")
    .style("opacity", 0)
    .style("transition", "opacity 0.1s ease 0.2s")
    .remove();
}
function createAxes(svg, xScale, yScale, width, height, options = {}) {
  // Default configuration
  const config = {
    xLabel: options.xLabel || "",
    yLabel: options.yLabel || "",
    xTicks: options.xTicks || 10,
    yTicks: options.yTicks || 10,
    xTickSize: options.xTickSize || 7,
    yTickSize: options.yTickSize || 7,
    margin: options.margin || margin,
    fontFamily: options.fontFamily || "Open Sans",
    xHidden: options.xHidden || false,
    yHidden: options.yHidden || false,
    yGrid: options.yGrid || false,
    yTickValues: options.yTickValues || 0,
    yTickUnit: options.yTickUnit || 0,
  };

  // Create X-axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickSize(config.xTickSize)
    .ticks(config.xTicks)
    .tickFormat(d3.format("d"));

  const xAxisGroup = svg
    .append("g")
    .attr("transform", `translate(0, ${height})`) // Move to the bottom of the chart area
    .call(xAxis);

  // Apply font style to all tick text
  xAxisGroup
    .selectAll("text")
    .style("font-family", config.fontFamily)
    .attr("dy", "1em")
    .style("font-size", "0.7rem");

  // Conditionally hide X-axis domain line
  if (config.xHidden) {
    xAxisGroup.select(".domain").style("stroke-width", "0");
  }

  // Add X-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 35)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("font-family", config.fontFamily) // Apply font style to axis label
    .text(config.xLabel);

  // Create Y-axis
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(config.yTicks)
    .tickSize(config.yTickSize);

  if (config.yTickValues) {
    yAxis.tickValues(config.yTickValues);
  }

  if (config.yTickUnit) {
    yAxis.tickFormat((d) => d + config.yTickUnit);
  }

  const yAxisGroup = svg.append("g").call(yAxis);
  // Apply font style to all tick text
  yAxisGroup
    .selectAll("text")
    .style("font-family", config.fontFamily)
    .style("fill", "#aaaaaa")
    .style("font-size", "0.7rem");

  // Conditionally hide Y-axis domain line
  if (config.yHidden) {
    yAxisGroup.select(".domain").style("stroke-width", "0");
  }

  // Conditionally add grid
  if (config.yGrid) {
    svg
      .selectAll(".tick")
      .append("line")
      .attr("x1", 0) // Starting X position (at the Y-axis)
      .attr("x2", width) // Ending X position (extend across the full width)
      .attr("y", (d) => yScale(d)) // Y position for each tick (using the scale)
      // .attr("y2", (d) => yScale(d)) // Y position for each tick (same as y1)
      .attr("stroke", "#ddd") // Grid line color (light gray)
      .attr("stroke-width", 0.8); // Line width
    // .attr("stroke-dasharray", "4,4"); // Optional dashed lines
  }

  // Add Y-axis label
  svg
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -config.margin.left + 30)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("font-family", config.fontFamily) // Apply font style to axis label
    .attr("transform", "rotate(-90)")
    .text(config.yLabel);
}
