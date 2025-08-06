"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Save, Download, Copy, FileText, Calculator, Calendar } from "lucide-react"
import { PORT_DISTANCES } from "@/lib/broker-utils"

interface VesselParticulars {
  vesselName: string
  dwt: number
  draft: number
  tpc: number
  built: number
  vesselType: string
  flag: string
  consumption: {
    laden: number
    ballast: number
    port: number
  }
  speed: {
    laden: number
    ballast: number
  }
}

interface CargoLeg {
  id: string
  account: string
  cargoName: string
  loadingPort: string
  dischargingPort: string
  quantity: number
  freightRate: number
  freightTerm: string
  commission: number
  brokerage: number
}

interface PortCall {
  id: string
  type: "ballast" | "loading" | "discharging" | "bunker" | "canal"
  portName: string
  distance: number
  speed: number
  seaDays: number
  portDays: number
  portCharges: number
  arrival: string
  departure: string
}

interface BunkerExpense {
  fuelType: string
  price: number
  consumption: number
  expense: number
}

interface DemurrageCalculation {
  loadingLaytime: number
  dischargeLaytime: number
  loadingTimeUsed: number
  dischargeTimeUsed: number
  demurrageRate: number
  despatchRate: number
}

interface Scenario {
  id: string
  name: string
  vessel: VesselParticulars
  cargo: CargoLeg[]
  portRotation: PortCall[]
  bunkerExpenses: BunkerExpense[]
  operatingExpenses: {
    dailyHire: number
    addComm: number
    brokerage: number
    freightTax: number
    otherTerms: number
    portCharges: number
  }
  demurrage: DemurrageCalculation
}

// Major ports for autocomplete
const MAJOR_PORTS = [
  "Singapore",
  "Rotterdam",
  "Shanghai",
  "Antwerp",
  "Busan",
  "Qingdao",
  "Hamburg",
  "Los Angeles",
  "Ningbo",
  "Dubai",
  "Tianjin",
  "Guangzhou",
  "New York",
  "Kaohsiung",
  "Port Klang",
  "Dalian",
  "Xiamen",
  "Valencia",
  "Manila",
  "Laem Chabang",
  "Colombo",
  "Tanjung Pelepas",
  "Algeciras",
  "Jawaharlal Nehru",
  "Ho Chi Minh City",
  "Jeddah",
  "Felixstowe",
  "Santos",
  "Piraeus",
  "Mundra",
  "Vancouver",
  "Tubarao",
  "Richards Bay",
  "Newcastle",
  "Fujairah",
  "Houston",
  "Gibraltar",
  "Ravenna",
  "Rizhao",
]

// Calculate distance between ports
const calculateDistance = (port1: string, port2: string): number => {
  const key = `${port1}-${port2}`
  const reverseKey = `${port2}-${port1}`

  if (PORT_DISTANCES[key]) return PORT_DISTANCES[key]
  if (PORT_DISTANCES[reverseKey]) return PORT_DISTANCES[reverseKey]

  // Default distance if not found
  return 5000
}

export function VoyageCalculator() {
  const [scenario, setScenario] = useState<Scenario>({
    id: "base",
    name: "Base Scenario",
    vessel: {
      vesselName: "",
      dwt: 0,
      draft: 0,
      tpc: 0,
      built: 2010,
      vesselType: "Bulk Carrier",
      flag: "Panama",
      consumption: { laden: 25, ballast: 22, port: 5 },
      speed: { laden: 14, ballast: 14 },
    },
    cargo: [
      {
        id: "1",
        account: "S011ACCT1",
        name: "Iron Ore",
        loadingPort: "Tubarao",
        dischargingPort: "Qingdao",
        quantity: 150000,
        freightRate: 28.0,
        freightTerm: "FIO",
        commission: 3.8,
        brokerage: 1.3,
      },
    ],
    portRotation: [
      {
        id: "1",
        type: "ballast",
        portName: "Singapore",
        distance: 2461,
        speed: 14,
        seaDays: 7.3,
        portDays: 0,
        portCharges: 3000,
        arrival: "2024-06-08 01:09",
        departure: "2024-06-08 15:37",
      },
      {
        id: "2",
        type: "loading",
        portName: "Tubarao",
        distance: 8760,
        speed: 14,
        seaDays: 26.1,
        portDays: 2.5,
        portCharges: 45000,
        arrival: "2024-06-08 21:21",
        departure: "2024-06-11 23:49",
      },
    ],
    bunkerExpenses: [
      { fuelType: "VLSFO", price: 580, consumption: 1411.4, expense: 818612 },
      { fuelType: "MGO", price: 720, consumption: 4.3, expense: 3096 },
    ],
    operatingExpenses: {
      dailyHire: 17000,
      addComm: 51187.5,
      brokerage: 19062.5,
      freightTax: 0,
      otherTerms: 0,
      portCharges: 383000,
    },
    demurrage: {
      loadingLaytime: 72,
      dischargeLaytime: 72,
      loadingTimeUsed: 60,
      dischargeTimeUsed: 48,
      demurrageRate: 25000,
      despatchRate: 12500,
    },
  })

  const updateScenario = (path: string, value: any) => {
    setScenario((prev) => {
      const keys = path.split(".")
      const updated = { ...prev }
      let current = updated

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return updated
    })
  }

  const [scenarios, setScenarios] = useState<Scenario[]>([scenario])

  const [activeScenario, setActiveScenario] = useState<string>("base")
  const [showDemurrage, setShowDemurrage] = useState<boolean>(false)
  const [showScenarioComparison, setShowScenarioComparison] = useState<boolean>(false)
  const [portSearchTerm, setPortSearchTerm] = useState<string>("")
  const [filteredPorts, setFilteredPorts] = useState<string[]>([])

  // Get current scenario
  const currentScenario = scenario //scenarios.find((s) => s.id === activeScenario) || scenarios[0]

  // Destructure current scenario for easier access
  const { vessel, cargo: cargoLegs, portRotation, bunkerExpenses, operatingExpenses, demurrage } = currentScenario

  // Reference for export
  const calculatorRef = useRef<HTMLDivElement>(null)

  const calculations = useMemo(() => {
    const totalQuantity = scenario.cargo.reduce((sum, leg) => sum + leg.quantity, 0)
    const totalFreight = scenario.cargo.reduce((sum, leg) => sum + leg.quantity * leg.freightRate, 0)
    const totalSeaDays = scenario.portRotation?.reduce((sum, port) => sum + port.seaDays, 0) || 0
    const totalPortDays = scenario.portRotation?.reduce((sum, port) => sum + port.portDays, 0) || 0
    const totalVoyageDays = totalSeaDays + totalPortDays
    const totalBunkerExpense = scenario.bunkerExpenses.reduce((sum, bunker) => sum + bunker.expense, 0)
    const totalPortCharges = scenario.portRotation.reduce((sum, port) => sum + port.portCharges, 0)

    const grossRevenue = totalFreight
    const totalExpenses =
      scenario.operatingExpenses.dailyHire * totalVoyageDays +
      scenario.operatingExpenses.addComm +
      scenario.operatingExpenses.brokerage +
      totalBunkerExpense +
      totalPortCharges
    const netProfit = grossRevenue - totalExpenses
    const tceDaily = netProfit / totalVoyageDays

    // Demurrage calculation
    const loadingDemurrage =
      demurrage.loadingTimeUsed > demurrage.loadingLaytime
        ? ((demurrage.loadingTimeUsed - demurrage.loadingLaytime) * demurrage.demurrageRate) / 24
        : 0

    const loadingDespatch =
      demurrage.loadingTimeUsed < demurrage.loadingLaytime
        ? ((demurrage.loadingLaytime - demurrage.loadingTimeUsed) * demurrage.despatchRate) / 24
        : 0

    const dischargeDemurrage =
      demurrage.dischargeTimeUsed > demurrage.dischargeLaytime
        ? ((demurrage.dischargeTimeUsed - demurrage.dischargeLaytime) * demurrage.demurrageRate) / 24
        : 0

    const dischargeDespatch =
      demurrage.dischargeTimeUsed < demurrage.dischargeLaytime
        ? ((demurrage.dischargeLaytime - demurrage.dischargeTimeUsed) * demurrage.despatchRate) / 24
        : 0

    const totalDemurrage = loadingDemurrage + dischargeDemurrage
    const totalDespatch = loadingDespatch + dischargeDespatch
    const netDemurrage = totalDemurrage - totalDespatch

    return {
      totalQuantity,
      totalFreight,
      totalSeaDays,
      totalPortDays,
      totalVoyageDays,
      grossRevenue,
      totalExpenses,
      netProfit,
      tceDaily,
      loadingDemurrage,
      loadingDespatch,
      dischargeDemurrage,
      dischargeDespatch,
      totalDemurrage,
      totalDespatch,
      netDemurrage,
      totalBunkerExpense,
      totalPortCharges,
    }
  }, [scenario])

  // Calculations
  const {
    totalQuantity,
    totalFreight,
    totalSeaDays,
    totalPortDays,
    totalVoyageDays,
    grossRevenue,
    totalExpenses,
    netProfit,
    tceDaily,
    loadingDemurrage,
    loadingDespatch,
    dischargeDemurrage,
    dischargeDespatch,
    totalDemurrage,
    totalDespatch,
    netDemurrage,
    totalBunkerExpense,
    totalPortCharges,
  } = calculations

  // Update functions
  // const updateScenario = (updates: Partial<Scenario>) => {
  //   setScenarios(scenarios.map((s) => (s.id === activeScenario ? { ...s, ...updates } : s)))
  // }

  const updateVesselParticulars = (updates: Partial<VesselParticulars>) => {
    updateScenario("vessel", { ...vessel, ...updates })
  }

  const updateDemurrage = (updates: Partial<DemurrageCalculation>) => {
    updateScenario("demurrage", { ...demurrage, ...updates })
  }

  const addCargoLeg = () => {
    const newLeg: CargoLeg = {
      id: Date.now().toString(),
      account: `S011ACCT${cargoLegs.length + 1}`,
      cargoName: "",
      loadingPort: "",
      dischargingPort: "",
      quantity: 0,
      freightRate: 0,
      freightTerm: "FIO",
      commission: 3.8,
      brokerage: 1.3,
    }
    updateScenario("cargo", [...cargoLegs, newLeg])
  }

  const removeCargoLeg = (id: string) => {
    updateScenario(
      "cargo",
      cargoLegs.filter((leg) => leg.id !== id),
    )
  }

  const updateCargoLeg = (id: string, field: keyof CargoLeg, value: any) => {
    updateScenario(
      "cargo",
      cargoLegs.map((leg) => (leg.id === id ? { ...leg, [field]: value } : leg)),
    )

    // Auto-calculate distance if both ports are set
    if (field === "loadingPort" || field === "dischargingPort") {
      const leg = cargoLegs.find((l) => l.id === id)
      if (leg) {
        const loadPort = field === "loadingPort" ? value : leg.loadingPort
        const dischargePort = field === "dischargingPort" ? value : leg.dischargingPort

        if (loadPort && dischargePort) {
          // Find or update port rotation entries
          // This is simplified - a real implementation would be more complex
          console.log(
            `Distance between ${loadPort} and ${dischargePort}: ${calculateDistance(loadPort, dischargePort)}`,
          )
        }
      }
    }
  }

  // Port search
  const handlePortSearch = (term: string) => {
    setPortSearchTerm(term)
    if (term.length > 1) {
      const filtered = MAJOR_PORTS.filter((port) => port.toLowerCase().includes(term.toLowerCase()))
      setFilteredPorts(filtered)
    } else {
      setFilteredPorts([])
    }
  }

  // Create new scenario
  const createNewScenario = () => {
    const newId = `scenario-${Date.now()}`
    const newScenario: Scenario = {
      ...currentScenario,
      id: newId,
      name: `Scenario ${scenarios.length + 1}`,
    }
    setScenarios([...scenarios, newScenario])
    setActiveScenario(newId)
  }

  // Export to PDF
  const exportToPDF = () => {
    alert("Exporting to PDF... This would generate a professional PDF report of the current voyage calculation.")
    // In a real implementation, this would use a library like jsPDF or call a server endpoint
  }

  // Export to Excel
  const exportToExcel = () => {
    alert("Exporting to Excel... This would generate an Excel file with all calculation details.")
    // In a real implementation, this would use a library like xlsx or call a server endpoint
  }

  return (
    <div className="space-y-6" ref={calculatorRef}>
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 bg-slate-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Select value={activeScenario} onValueChange={setActiveScenario}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={createNewScenario}>
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowScenarioComparison(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Compare
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="default" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Vessel Particulars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vesselName">Vessel Name</Label>
                <Input
                  id="vesselName"
                  value={vessel.vesselName}
                  onChange={(e) => updateVesselParticulars({ vesselName: e.target.value })}
                  placeholder="M/V EXAMPLE"
                />
              </div>
              <div>
                <Label htmlFor="dwt">DWT</Label>
                <Input
                  id="dwt"
                  type="number"
                  value={vessel.dwt}
                  onChange={(e) => updateVesselParticulars({ dwt: Number(e.target.value) })}
                  placeholder="56811"
                />
              </div>
              <div>
                <Label htmlFor="draft">Draft (M)</Label>
                <Input
                  id="draft"
                  type="number"
                  step="0.1"
                  value={vessel.draft}
                  onChange={(e) => updateVesselParticulars({ draft: Number(e.target.value) })}
                  placeholder="12.80"
                />
              </div>
              <div>
                <Label htmlFor="tpc">TPC</Label>
                <Input
                  id="tpc"
                  type="number"
                  step="0.1"
                  value={vessel.tpc}
                  onChange={(e) => updateVesselParticulars({ tpc: Number(e.target.value) })}
                  placeholder="58.00"
                />
              </div>
              <div>
                <Label htmlFor="built">Built</Label>
                <Input
                  id="built"
                  type="number"
                  value={vessel.built}
                  onChange={(e) => updateVesselParticulars({ built: Number(e.target.value) })}
                  placeholder="2010"
                />
              </div>
              <div>
                <Label htmlFor="vesselType">Type</Label>
                <Select
                  value={vessel.vesselType}
                  onValueChange={(value) => updateVesselParticulars({ vesselType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                    <SelectItem value="Handysize">Handysize</SelectItem>
                    <SelectItem value="Supramax">Supramax</SelectItem>
                    <SelectItem value="Panamax">Panamax</SelectItem>
                    <SelectItem value="Capesize">Capesize</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Consumption (MT/Day)</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="w-16">Laden:</Label>
                    <Input
                      type="number"
                      value={vessel.consumption.laden}
                      onChange={(e) =>
                        updateVesselParticulars({
                          consumption: { ...vessel.consumption, laden: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-16">Ballast:</Label>
                    <Input
                      type="number"
                      value={vessel.consumption.ballast}
                      onChange={(e) =>
                        updateVesselParticulars({
                          consumption: { ...vessel.consumption, ballast: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-16">Port:</Label>
                    <Input
                      type="number"
                      value={vessel.consumption.port}
                      onChange={(e) =>
                        updateVesselParticulars({
                          consumption: { ...vessel.consumption, port: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Speed (Knots)</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="w-16">Laden:</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vessel.speed.laden}
                      onChange={(e) =>
                        updateVesselParticulars({
                          speed: { ...vessel.speed, laden: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-16">Ballast:</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vessel.speed.ballast}
                      onChange={(e) =>
                        updateVesselParticulars({
                          speed: { ...vessel.speed, ballast: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cargo Legs</CardTitle>
            <Button onClick={addCargoLeg} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Cargo Leg
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cargoLegs.map((leg, index) => (
                <div key={leg.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Leg {index + 1}</Badge>
                    {cargoLegs.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCargoLeg(leg.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Account</Label>
                      <Input value={leg.account} onChange={(e) => updateCargoLeg(leg.id, "account", e.target.value)} />
                    </div>
                    <div>
                      <Label>Cargo Name</Label>
                      <Select
                        value={leg.cargoName}
                        onValueChange={(value) => updateCargoLeg(leg.id, "cargoName", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iron Ore">Iron Ore</SelectItem>
                          <SelectItem value="Coal">Coal</SelectItem>
                          <SelectItem value="Grain">Grain</SelectItem>
                          <SelectItem value="Steel">Steel</SelectItem>
                          <SelectItem value="Bauxite">Bauxite</SelectItem>
                          <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Loading Port</Label>
                      <div className="relative">
                        <Input
                          value={leg.loadingPort}
                          onChange={(e) => {
                            updateCargoLeg(leg.id, "loadingPort", e.target.value)
                            handlePortSearch(e.target.value)
                          }}
                          placeholder="Port name"
                        />
                        {portSearchTerm && filteredPorts.length > 0 && portSearchTerm === leg.loadingPort && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredPorts.map((port) => (
                              <div
                                key={port}
                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                                onClick={() => {
                                  updateCargoLeg(leg.id, "loadingPort", port)
                                  setPortSearchTerm("")
                                  setFilteredPorts([])
                                }}
                              >
                                {port}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Discharging Port</Label>
                      <div className="relative">
                        <Input
                          value={leg.dischargingPort}
                          onChange={(e) => {
                            updateCargoLeg(leg.id, "dischargingPort", e.target.value)
                            handlePortSearch(e.target.value)
                          }}
                          placeholder="Port name"
                        />
                        {portSearchTerm && filteredPorts.length > 0 && portSearchTerm === leg.dischargingPort && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredPorts.map((port) => (
                              <div
                                key={port}
                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                                onClick={() => {
                                  updateCargoLeg(leg.id, "dischargingPort", port)
                                  setPortSearchTerm("")
                                  setFilteredPorts([])
                                }}
                              >
                                {port}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label>Quantity (MT)</Label>
                      <Input
                        type="number"
                        value={leg.quantity}
                        onChange={(e) => updateCargoLeg(leg.id, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Freight Rate</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={leg.freightRate}
                        onChange={(e) => updateCargoLeg(leg.id, "freightRate", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Term</Label>
                      <Select
                        value={leg.freightTerm}
                        onValueChange={(value) => updateCargoLeg(leg.id, "freightTerm", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIO">FIO</SelectItem>
                          <SelectItem value="FIOS">FIOS</SelectItem>
                          <SelectItem value="FIOST">FIOST</SelectItem>
                          <SelectItem value="Liner Terms">Liner Terms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Commission (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={leg.commission}
                        onChange={(e) => updateCargoLeg(leg.id, "commission", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Brokerage (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={leg.brokerage}
                        onChange={(e) => updateCargoLeg(leg.id, "brokerage", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">Total Quantity</div>
                    <div className="text-lg">{totalQuantity.toLocaleString()} MT</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Total Freight</div>
                    <div className="text-lg">${totalFreight.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Average Rate</div>
                    <div className="text-lg">${(totalFreight / totalQuantity || 0).toFixed(2)}/MT</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Port Rotation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Total Duration: {totalVoyageDays.toFixed(1)} Days (Ballast: {(totalSeaDays * 0.3).toFixed(1)}, Laden:{" "}
                {(totalSeaDays * 0.7).toFixed(1)}, Port: {totalPortDays.toFixed(1)})
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Port Name</th>
                      <th className="text-left p-2">Distance</th>
                      <th className="text-left p-2">Speed</th>
                      <th className="text-left p-2">Sea Days</th>
                      <th className="text-left p-2">Port Days</th>
                      <th className="text-left p-2">Port Charges</th>
                      <th className="text-left p-2">Arrival</th>
                      <th className="text-left p-2">Departure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portRotation.map((port) => (
                      <tr key={port.id} className="border-b">
                        <td className="p-2">
                          <Badge variant={port.type === "loading" ? "default" : "secondary"}>{port.type}</Badge>
                        </td>
                        <td className="p-2">{port.portName}</td>
                        <td className="p-2">{port.distance}</td>
                        <td className="p-2">{port.speed}</td>
                        <td className="p-2">{port.seaDays.toFixed(1)}</td>
                        <td className="p-2">{port.portDays.toFixed(1)}</td>
                        <td className="p-2">${port.portCharges.toLocaleString()}</td>
                        <td className="p-2">{port.arrival}</td>
                        <td className="p-2">{port.departure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Bunker Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-semibold border-b pb-2">
                <div>Fuel Type</div>
                <div>Price/MT</div>
                <div>Consumption (MT)</div>
                <div>Expense (USD)</div>
              </div>

              {bunkerExpenses.map((bunker, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <Badge variant="outline">{bunker.fuelType}</Badge>
                  </div>
                  <div>${bunker.price}</div>
                  <div>{bunker.consumption.toFixed(1)}</div>
                  <div>${bunker.expense.toLocaleString()}</div>
                </div>
              ))}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-semibold">
                <div>Total Bunker Expense</div>
                <div></div>
                <div>{bunkerExpenses.reduce((sum, b) => sum + b.consumption, 0).toFixed(1)} MT</div>
                <div>${totalBunkerExpense.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Demurrage Calculator</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowDemurrage(!showDemurrage)}>
              <Calendar className="h-4 w-4 mr-2" />
              {showDemurrage ? "Hide Details" : "Show Details"}
            </Button>
          </CardHeader>
          <CardContent>
            {showDemurrage ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Loading Port</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Laytime (hours)</Label>
                        <Input
                          type="number"
                          value={demurrage.loadingLaytime}
                          onChange={(e) => updateDemurrage({ loadingLaytime: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Time Used (hours)</Label>
                        <Input
                          type="number"
                          value={demurrage.loadingTimeUsed}
                          onChange={(e) => updateDemurrage({ loadingTimeUsed: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span
                        className={
                          demurrage.loadingTimeUsed > demurrage.loadingLaytime ? "text-red-500" : "text-green-500"
                        }
                      >
                        {demurrage.loadingTimeUsed > demurrage.loadingLaytime
                          ? `${demurrage.loadingTimeUsed - demurrage.loadingLaytime} hours demurrage`
                          : `${demurrage.loadingLaytime - demurrage.loadingTimeUsed} hours despatch`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Discharge Port</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Laytime (hours)</Label>
                        <Input
                          type="number"
                          value={demurrage.dischargeLaytime}
                          onChange={(e) => updateDemurrage({ dischargeLaytime: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Time Used (hours)</Label>
                        <Input
                          type="number"
                          value={demurrage.dischargeTimeUsed}
                          onChange={(e) => updateDemurrage({ dischargeTimeUsed: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span
                        className={
                          demurrage.dischargeTimeUsed > demurrage.dischargeLaytime ? "text-red-500" : "text-green-500"
                        }
                      >
                        {demurrage.dischargeTimeUsed > demurrage.dischargeLaytime
                          ? `${demurrage.dischargeTimeUsed - demurrage.dischargeLaytime} hours demurrage`
                          : `${demurrage.dischargeLaytime - demurrage.dischargeTimeUsed} hours despatch`}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Demurrage Rate ($/day)</Label>
                      <Input
                        type="number"
                        value={demurrage.demurrageRate}
                        onChange={(e) => updateDemurrage({ demurrageRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Despatch Rate ($/day)</Label>
                      <Input
                        type="number"
                        value={demurrage.despatchRate}
                        onChange={(e) => updateDemurrage({ despatchRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Loading Status</div>
                  <div className={`font-semibold ${loadingDemurrage > 0 ? "text-red-500" : "text-green-500"}`}>
                    {loadingDemurrage > 0
                      ? `${(demurrage.loadingTimeUsed - demurrage.loadingLaytime).toFixed(1)} hrs demurrage`
                      : `${(demurrage.loadingLaytime - demurrage.loadingTimeUsed).toFixed(1)} hrs despatch`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Discharge Status</div>
                  <div className={`font-semibold ${dischargeDemurrage > 0 ? "text-red-500" : "text-green-500"}`}>
                    {dischargeDemurrage > 0
                      ? `${(demurrage.dischargeTimeUsed - demurrage.dischargeLaytime).toFixed(1)} hrs demurrage`
                      : `${(demurrage.dischargeLaytime - demurrage.dischargeTimeUsed).toFixed(1)} hrs despatch`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Net Amount</div>
                  <div className={`font-semibold ${netDemurrage > 0 ? "text-red-500" : "text-green-500"}`}>
                    ${Math.abs(netDemurrage).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Impact on TCE</div>
                  <div className={`font-semibold ${netDemurrage > 0 ? "text-red-500" : "text-green-500"}`}>
                    ${(netDemurrage / totalVoyageDays).toLocaleString()}/day
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Daily Hire:</span>
                    <span>${operatingExpenses.dailyHire.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add. Commission:</span>
                    <span>${operatingExpenses.addComm.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brokerage:</span>
                    <span>${operatingExpenses.brokerage.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Freight Tax:</span>
                    <span>${operatingExpenses.freightTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Terms:</span>
                    <span>${operatingExpenses.otherTerms.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Port Charges:</span>
                    <span>${totalPortCharges.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Gross Revenue:</span>
                  <span className="font-bold">${grossRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span>{totalQuantity.toLocaleString()} MT</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rate:</span>
                  <span>${(grossRevenue / totalQuantity || 0).toFixed(2)}/MT</span>
                </div>
                {netDemurrage !== 0 && (
                  <div className="flex justify-between">
                    <span>Demurrage/Despatch:</span>
                    <span className={netDemurrage > 0 ? "text-red-500" : "text-green-500"}>
                      {netDemurrage > 0 ? "-" : "+"} ${Math.abs(netDemurrage).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Operating Costs:</span>
                  <span>${(operatingExpenses.dailyHire * totalVoyageDays).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bunker Costs:</span>
                  <span>${totalBunkerExpense.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Port Charges:</span>
                  <span>${totalPortCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commissions:</span>
                  <span>${(operatingExpenses.addComm + operatingExpenses.brokerage).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Expenses:</span>
                  <span>${totalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-blue-600">Voyage Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Net Profit</div>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${(netProfit - netDemurrage).toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">TCE Daily</div>
                  <div className={`text-2xl font-bold ${tceDaily >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${(tceDaily - netDemurrage / totalVoyageDays).toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Voyage Days</div>
                  <div className="text-2xl font-bold text-blue-600">{totalVoyageDays.toFixed(1)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                  <div
                    className={`text-2xl font-bold ${((netProfit - netDemurrage) / grossRevenue) * 100 >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {(((netProfit - netDemurrage) / grossRevenue) * 100 || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scenario Comparison Dialog */}
      <Dialog open={showScenarioComparison} onOpenChange={setShowScenarioComparison}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Scenario Comparison</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scenario</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Expenses</th>
                  <th className="text-right p-2">Profit</th>
                  <th className="text-right p-2">TCE</th>
                  <th className="text-right p-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => {
                  // Simplified calculations for each scenario
                  const scenarioTotalFreight = scenario.cargo.reduce(
                    (sum, leg) => sum + leg.quantity * leg.freightRate,
                    0,
                  )
                  const scenarioTotalDays = scenario.portRotation.reduce(
                    (sum, port) => sum + port.seaDays + port.portDays,
                    0,
                  )
                  const scenarioExpenses =
                    scenario.operatingExpenses.dailyHire * scenarioTotalDays +
                    scenario.operatingExpenses.addComm +
                    scenario.operatingExpenses.brokerage +
                    scenario.bunkerExpenses.reduce((sum, b) => sum + b.expense, 0) +
                    scenario.portRotation.reduce((sum, p) => sum + p.portCharges, 0)
                  const scenarioProfit = scenarioTotalFreight - scenarioExpenses
                  const scenarioTCE = scenarioProfit / scenarioTotalDays
                  const scenarioMargin = (scenarioProfit / scenarioTotalFreight) * 100

                  return (
                    <tr key={scenario.id} className={`border-b ${scenario.id === activeScenario ? "bg-blue-50" : ""}`}>
                      <td className="p-2 font-medium">{scenario.name}</td>
                      <td className="text-right p-2">${scenarioTotalFreight.toLocaleString()}</td>
                      <td className="text-right p-2">${scenarioExpenses.toLocaleString()}</td>
                      <td className={`text-right p-2 ${scenarioProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${scenarioProfit.toLocaleString()}
                      </td>
                      <td className={`text-right p-2 ${scenarioTCE >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${scenarioTCE.toLocaleString()}
                      </td>
                      <td className={`text-right p-2 ${scenarioMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {scenarioMargin.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowScenarioComparison(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
