// ============================================================================
// CREATE NEW TOUR PAGE
// ============================================================================

import TourForm from '../components/TourForm'
import { INITIAL_FORM_DATA } from '../components/TourForm'

export default function NewTourPage() {
 return (
 <TourForm 
 initialData={INITIAL_FORM_DATA}
 isEditing={false}
 tourId={null}
 />
 )
}