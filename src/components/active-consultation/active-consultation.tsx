import React from 'react'
import {
  PatientDetails,
  usePatientDetails,
} from '../../context/consultation-context'
import ConsultationNotes from '../consultation-notes/consultation-notes'

const checkActiveVisit = patientDetails => patientDetails?.isActiveVisit

function ActiveConsultation() {
  const patientDetails: PatientDetails = usePatientDetails()

  return (
    checkActiveVisit(patientDetails) && (
      <div id="sa-consultation">
        <ConsultationNotes />
      </div>
    )
  )
}

export default ActiveConsultation
