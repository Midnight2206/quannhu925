import Home from "~/pages/Home"
import QuanT from "~/pages/Quantrang"
import QuantrangPilot from "~/pages/QuantrangPilot"

const publicRoutes = [
    {path: '/', conponent: Home},
    {path: '/quantrang/add', conponent: QuanT.AddQuanNhan, layout: null},
    {path: '/quantrang/statistical', conponent: QuanT.Statistical, layout: null},
    {path: '/quantrang/criterion', conponent: QuanT.Criterion, layout: null},
    {path: '/quantrang/individual/:slug', conponent: QuanT.Individual, layout: null},
    {path: '/quantrang/dispensation/:id', conponent: QuanT.Dispensation, layout: null},
    {path: '/quantrang/increase/list', conponent: QuanT.IncreaseList, layout: null},
    {path: '/quantrang/decrease/temporarySave/list', conponent: QuanT.DecreaseTemporarySavesList, layout: null},
    {path: '/quantrang/increase', conponent: QuanT.IncreaseMilitaries, layout: null},
    {path: 'quantrang/increase/temporarySave/list', conponent: QuanT.IncreaseTemporarySavesList, layout: null},
    {path: '/quantrang/importlist', conponent: QuanT.importList, layout: null},
    {path: '/quantrang/shared', conponent: QuanT.SharedMilitaryEquipment, layout: null},
    {path: '/quantrang', conponent: QuanT.Quantrang, layout: null},
    {path: '/quantrang/decrease/list', conponent: QuanT.DecreaseList, layout: null},
    {path: '/quantrang/decrease', conponent: QuanT.DecreaseMilitaries, layout: null},
    {path: '/quantrang/test', conponent: QuanT.Test, layout: null},
    {path: '/pilots', conponent: QuantrangPilot.ListPilots, layout: null},
    {path: '/pilots/import', conponent: QuantrangPilot.ImportDataFromExcel, layout: null},
    {path: 'pilots/individual/:slug', conponent: QuantrangPilot.Individual, layout: null},
    {path: '/pilots/dispensation/:id', conponent: QuantrangPilot.Dispensation, layout: null},

]
    
const privateRoutes = {

}

export {publicRoutes, privateRoutes}