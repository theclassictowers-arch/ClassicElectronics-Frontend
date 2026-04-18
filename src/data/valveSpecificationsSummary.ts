/**
 * Valve Specifications Summary
 * ============================
 * This file shows the COMPLETE technical specifications that should be displayed
 * for ALL valve models in the Classic Electronics catalog.
 *
 * Based on user requirements, ALL valves must show these specifications:
 * 1. Orifice (mm)
 * 2. Connection Port Size
 * 3. Working Pressure
 * 4. Ambient Temperature
 * 5. Diaphragm Material
 * 6. Relative Humidity
 * 7. Working Medium
 * 8. Voltage
 * 9. Diaphragm Life Cycles
 * 10. Diaphragm Temperature Ranges
 */

export const valveTechnicalSpecsTemplate = {
  // UNIVERSAL SPECIFICATIONS (apply to ALL valves)
  universalSpecs: {
    workingPressure: "0.3-0.8 Mpa (43.5-116 PSI)",
    ambientTemperature: "-5 to 50°C",
    relativeHumidity: "<85%",
    workingMedium: "Clear air",
    voltage: "AC110V / AC220V / DC24V / AC24V",
    diaphragmLifeCycles: "Over 1 million Cycles",
    diaphragmMaterial: "NBR (Nitrile) or VITON",
    diaphragmMaterialDetails: {
      nbr: "-10 to 80°C",
      viton: "-10 to 200°C"
    },
    certifications: ["CE", "ISO9001"],
    temperatureRange: {
      min: -10,
      max: 70,
      unit: "°C"
    }
  },

  // SCG353 SERIES (Right Angle Type)
  scg353Series: [
    {
      model: "SCG353A043",
      portSize: "3/4\"",
      orifice: "19 mm",
      connectionPortSize: "G3/4\" or 3/4\" NPT",
      type: "Right Angle Type",
      price: 12500
    },
    {
      model: "SCG353A044",
      portSize: "1\"",
      orifice: "25 mm",
      connectionPortSize: "G1\" or 1\" NPT",
      type: "Right Angle Type",
      price: 13500
    },
    {
      model: "SCG353A047",
      portSize: "1-1/4\"",
      orifice: "32 mm",
      connectionPortSize: "G1-1/4\" or 1-1/4\" NPT",
      type: "Right Angle Type",
      price: 14500
    },
    {
      model: "SCG353A050",
      portSize: "2\"",
      orifice: "50 mm",
      connectionPortSize: "G2\" or 2\" NPT",
      type: "Right Angle Type",
      price: 16500
    },
    {
      model: "SCG353A051",
      portSize: "2-1/2\"",
      orifice: "63 mm",
      connectionPortSize: "G2-1/2\" or 2-1/2\" NPT",
      type: "Right Angle Type",
      price: 17500
    },
    {
      model: "SCXE353.060",
      portSize: "3\"",
      orifice: "76 mm",
      connectionPortSize: "G3\" or 3\" NPT",
      type: "Right Angle Type",
      price: 18500
    }
  ],

  // SCR353 SERIES (Submerged Type)
  scr353Series: [
    {
      model: "SCR353A230",
      portSize: "3\"",
      orifice: "76 mm",
      connectionPortSize: "Submerged Type",
      type: "Submerged Type",
      price: 19500
    },
    {
      model: "SCR353A235",
      portSize: "3.5\"",
      orifice: "89 mm",
      connectionPortSize: "Submerged Type",
      type: "Submerged Type",
      price: 21500
    }
  ],

  // GOYEN TMF SERIES
  goyenSeries: [
    {
      model: "TMF-Z-20",
      portSize: "20mm",
      orifice: "20 mm",
      connectionPortSize: "G1/4\" or 1/4\" NPT",
      type: "Solenoid Valve",
      price: 20933
    },
    {
      model: "TMF-Z-25",
      portSize: "25mm",
      orifice: "25 mm",
      connectionPortSize: "G1/2\" or 1/2\" NPT",
      type: "Solenoid Valve",
      price: 22933
    },
    {
      model: "TMF-Z-40S",
      portSize: "40mm",
      orifice: "40 mm",
      connectionPortSize: "G1\" or 1\" NPT",
      type: "Solenoid Valve",
      price: 26933
    },
    {
      model: "TMF-Z-50S",
      portSize: "50mm",
      orifice: "50 mm",
      connectionPortSize: "G1-1/4\" or 1-1/4\" NPT",
      type: "Solenoid Valve",
      price: 29933
    },
    {
      model: "TMF-Z-62S",
      portSize: "62mm",
      orifice: "62 mm",
      connectionPortSize: "G1-1/2\" or 1-1/2\" NPT",
      type: "Solenoid Valve",
      price: 32933
    },
    {
      model: "TMF-Z-76S",
      portSize: "76mm",
      orifice: "76 mm",
      connectionPortSize: "G2\" or 2\" NPT",
      type: "Solenoid Valve",
      price: 35933
    }
  ],

  // HOW TO DISPLAY SPECIFICATIONS IN UI
  displayTemplate: {
    title: "Technical Specifications",
    sections: [
      {
        title: "General Specifications",
        items: [
          { label: "Working Pressure", value: "0.3-0.8 Mpa (43.5-116 PSI)" },
          { label: "Ambient Temperature", value: "-5 to 50°C" },
          { label: "Relative Humidity", value: "<85%" },
          { label: "Working Medium", value: "Clear air" },
          { label: "Voltage", value: "AC110V / AC220V / DC24V / AC24V" },
          { label: "Diaphragm Life Cycles", value: "Over 1 million Cycles" }
        ]
      },
      {
        title: "Diaphragm Material Options",
        items: [
          { label: "NBR (Nitrile)", value: "-10 to 80°C" },
          { label: "VITON", value: "-10 to 200°C" }
        ]
      },
      {
        title: "Certifications",
        items: [
          { label: "Quality", value: "ISO9001" },
          { label: "Safety", value: "CE" }
        ]
      }
    ]
  }
};

// Helper function to generate complete specs for any valve
export function getCompleteValveSpecs(model: string) {
  const allValves = [
    ...valveTechnicalSpecsTemplate.scg353Series,
    ...valveTechnicalSpecsTemplate.scr353Series,
    ...valveTechnicalSpecsTemplate.goyenSeries
  ];

  const valve = allValves.find(v => v.model === model);
  if (!valve) return null;

  return {
    ...valve,
    ...valveTechnicalSpecsTemplate.universalSpecs
  };
}

// Example: How to display specs for TMF-Z-20
export const exampleSpecsForTMFZ20 = getCompleteValveSpecs("TMF-Z-20");

// Export summary
export default {
  universalSpecs: valveTechnicalSpecsTemplate.universalSpecs,
  allValves: [
    ...valveTechnicalSpecsTemplate.scg353Series,
    ...valveTechnicalSpecsTemplate.scr353Series,
    ...valveTechnicalSpecsTemplate.goyenSeries
  ],
  totalValves: (
    valveTechnicalSpecsTemplate.scg353Series.length +
    valveTechnicalSpecsTemplate.scr353Series.length +
    valveTechnicalSpecsTemplate.goyenSeries.length
  ),
  getCompleteValveSpecs,
  displayTemplate: valveTechnicalSpecsTemplate.displayTemplate
};