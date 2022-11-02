import React, {useEffect, useState} from 'react'
import {getApiCall} from '../utils/api-utils'
import {customVisitUrl} from '../utils/constants'
import {
  getActiveConsultationEncounter,
  getConsultationObs,
} from '../utils/encounter-details/encounter-details'
import {
  getLocationUuid,
  getPatientUuid,
} from '../utils/patient-details/patient-details'

export interface PatientDetails {
  patientUuid: string
  locationUuid: string
  isActiveVisit: boolean
}

export interface ConsultationContextProps {
  patientDetails: PatientDetails
  savedConsultationNotes: string
  setSavedConsultationNotes: React.Dispatch<React.SetStateAction<string>>
}

export const ConsultationContext =
  React.createContext<ConsultationContextProps>(null)

async function fetchActiveVisitResponse(patiendId, locationId) {
  const activeVisitResponse = await getApiCall(
    customVisitUrl(patiendId, locationId),
  )
  return activeVisitResponse
}

export function usePatientDetails() {
  const context = React.useContext(ConsultationContext)
  return context.patientDetails
}

export function useSavedConsultationNotes() {
  const context = React.useContext(ConsultationContext)
  return {
    savedConsultationNotes: context.savedConsultationNotes,
    setSavedConsultationNotes: context.setSavedConsultationNotes,
  }
}

function ConsultationContextProvider({children}) {
  const [patientDetails, setPatientDetails] = useState<PatientDetails>()
  const [patientUuid, setPatientUuid] = useState('')
  const [locationUuid, setLocationUuid] = useState('')
  const [savedConsultationNotes, setSavedConsultationNotes] = useState('')

  const updateSavedConsultationNotes = activeVisitResponse => {
    const consultationActiveEncounter =
      getActiveConsultationEncounter(activeVisitResponse)

    if (consultationActiveEncounter) {
      const consultationObs = getConsultationObs(consultationActiveEncounter)
      if (consultationObs) {
        const savedData = consultationObs.display.match(
          /^Consultation Note: (.*)/,
        )[1]
        setSavedConsultationNotes(savedData)
      }
    }
  }

  const updatePatientDetails = async (patientUuid, locationUuid) => {
    const activeVisitResponse = await fetchActiveVisitResponse(
      patientUuid,
      locationUuid,
    )
    const isActiveVisit = activeVisitResponse?.results?.length > 0

    if (isActiveVisit) {
      setPatientDetails({
        patientUuid: patientUuid,
        locationUuid: locationUuid,
        isActiveVisit: isActiveVisit,
      })
      updateSavedConsultationNotes(activeVisitResponse)
    }
  }

  useEffect(() => {
    if (patientUuid && locationUuid) {
      updatePatientDetails(patientUuid, locationUuid)
    } else {
      setPatientDetails({
        patientUuid: patientUuid,
        locationUuid: locationUuid,
        isActiveVisit: false,
      })
      setSavedConsultationNotes('')
    }
  }, [patientUuid, locationUuid])

  const onUrlChangeCallback = () => {
    setPatientUuid(getPatientUuid)
  }

  useEffect(() => {
    setPatientUuid(getPatientUuid())
    setLocationUuid(getLocationUuid())
    window.addEventListener('hashchange', onUrlChangeCallback)
  }, [])

  const value = {
    patientDetails,
    savedConsultationNotes,
    setSavedConsultationNotes,
  }

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  )
}

export default ConsultationContextProvider
