import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App/000--App/App'
import VisualTaskCosts from './App/030--VisualTaskCosts/VisualTaskCosts'
import TaskCostsInput from './App/010--TaskCostsInput/TaskcostsInput'
import TaskCostsPage from './App/020--TaskCostsPage/TaskCostsPage'
import Home from './App/005--Home/Home'
import Revenues from './App/040--Revenues/Revenues'
import Costs from './App/050--Costs/Costs'
import USDA from './App/060--USDA/USDA'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/login'
import ChangePassword from './components/ChangePassword'
import YearlyWages from './App/070--YearlyWages/YearlyWages'
import FullYear from './App/070--YearlyWages/071--FullYear/FullYear'
import EditWages from './App/070--YearlyWages/072--EditWages/EditWages'
import { DateProvider } from './context/date/DateProvider'
import ShowWages from './App/070--YearlyWages/073--ShowWages/ShowWages'
import OtherCostsInput from './App/080--OtherCostsInput/OtherCostsInput'
import UnitsSoldInput from './App/090--UnitsSoldInput/UnitsSoldInput'
import { UnitsProvider } from './context/units/UnitsProvider'
import { UnspecifiedProvider } from './context/unspecified/UnspecifiedProvider'
import EntriesJournal from './App/100-EntriesJournal/EntriesJournal'
import { FieldsProvider } from './context/fields/FieldsContextProvider'
import { SupervisorsProvider } from './context/supervisors/SupervisorsProvider'
import { VegetablesProvider } from './context/vegetables/VegetablesContextProvider'
import Administrative from './App/110--Administrative/Administrative'
import CulturesUpdate from './App/110--Administrative/113--CulturesUpdate/CulturesUpdate'
import { ProjectedRevenuesProvider } from './context/projectedRevenues/ProjectedRevenuesContextProvider'
import RevenuesAdmin from './App/110--Administrative/111--RevenuesUpdate/000--RevenuesAdmin'









const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: '/entrer-couts-des-taches',
        element: (
          <ProtectedRoute>
            <TaskCostsInput />
          </ProtectedRoute>
        ),
      },
      {
        path: '/entrer-salaires-annuels',
        element: (
          <ProtectedRoute>
            <YearlyWages />
          </ProtectedRoute>
        ),
      },
      {
        path: '/entree-salaires-annee-complete',
        element: (
          <ProtectedRoute>
            <FullYear />
          </ProtectedRoute>
        )
      },
      {
        path: '/modifier-salaires-annuels',
        element: (
          <ProtectedRoute>
            <EditWages />
          </ProtectedRoute>
        )
      },
      {
        path: '/couts-des-taches',
        element: (
          <ProtectedRoute>
            <TaskCostsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/couts-des-taches/visualisation',
        element: (
          <ProtectedRoute>
            <VisualTaskCosts />
          </ProtectedRoute>
        ),
      },
      {
        path: 'revenus',
        element: (
          <ProtectedRoute>
            <Revenues />
          </ProtectedRoute>
        ),
      },
      {
        path: '/couts',
        element: (
          <ProtectedRoute>
            <Costs />
          </ProtectedRoute>
        ),
      },
      {
        path: '/comparatif-usda',
        element: (
          <ProtectedRoute>
            <USDA />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'change-password',
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: 'visualisation-des-salaires',
        element: (
          <ProtectedRoute>
            <ShowWages />
          </ProtectedRoute>
        )
      },
      {
        path: 'entrer-autres-couts',
        element: (
          <ProtectedRoute>
            <OtherCostsInput />
          </ProtectedRoute>
        )
      },
      {
        path: '/entrer-unites-vendues',
        element: (
          <ProtectedRoute>
            <UnitsSoldInput />
          </ProtectedRoute>
        )
      },
      {
        path: '/journal-des-entrees',
        element: (
          <ProtectedRoute>
            <EntriesJournal />
          </ProtectedRoute>
        )
      },
      {
        path: '/gestion-administrative',
        element: (
          <ProtectedRoute>
            <Administrative />
          </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-administrative/cultures',
        element: (
          <ProtectedRoute>
            <CulturesUpdate />
          </ProtectedRoute>
        ),
      },
      {
        path: '/gestion-administrative/mise-a-jour-revenus',
        element: (
          <ProtectedRoute>
            <RevenuesAdmin />
          </ProtectedRoute>
        ),
      }
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <DateProvider>
        <UnitsProvider>
          <UnspecifiedProvider>
            <SupervisorsProvider>
              <VegetablesProvider>
                <FieldsProvider>
                  <ProjectedRevenuesProvider>
                    <RouterProvider router={router} />
                  </ProjectedRevenuesProvider>
                </FieldsProvider>
              </VegetablesProvider>
            </SupervisorsProvider>
          </UnspecifiedProvider>
        </UnitsProvider>
      </DateProvider>
    </AuthProvider>
  </StrictMode>,
)
