import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ConsultationContext,
  PatientDetails,
} from '../../context/consultation-context'
import {saveConsultationNotes} from '../consultation-pad-contents/consultation-pad-contents.resources'
import {ConsultationPad} from '../consultation-pad/consultation-pad'
import {FloatingConsultationButton} from '../floating-consultation-button/floating-consultation-button'

function ConsultationNotes() {
  const [showConsultationPad, setShowConsultationPad] = useState(false)
  const [consultationText, setConsultationText, consultationTextRef] =
    useStateRef('')
  const [savedNotes, setSavedNotes] = useState('')
  const patientDetails: PatientDetails = useContext(ConsultationContext)

  const handleSaveConsultationNotes = useCallback(() => {
    setShowConsultationPad(false)
    saveConsultationNotes(consultationTextRef.current, patientDetails)
    setSavedNotes(consultationTextRef.current)
  }, [consultationTextRef, patientDetails])

  useEffect(() => {
    const abortController = new AbortController()

    document.addEventListener(
      'click:saveConsultationNotes',
      handleSaveConsultationNotes,
      abortController,
    )
    return () => {
      abortController.abort()
      document.removeEventListener(
        'click:saveConsultationNotes',
        handleSaveConsultationNotes,
      )
    }
  }, [])

  return showConsultationPad ? (
    <ConsultationPad
      consultationText={consultationText}
      setConsultationText={setConsultationText}
      setShowConsultationPad={setShowConsultationPad}
    />
  ) : (
    <FloatingConsultationButton
      isUnsavedNotesPresent={
        consultationText != savedNotes && consultationText != ''
      }
      setShowConsultationPad={setShowConsultationPad}
    />
  )
}

const useStateRef = initialState => {
  const [state, _setState] = useState(initialState)
  const ref = useRef(initialState)

  const setState = data => {
    ref.current = data
    _setState(data)
  }

  return [state, setState, ref]
}

export default ConsultationNotes
