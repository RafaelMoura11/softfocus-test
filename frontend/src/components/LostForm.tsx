import { useContext, useState } from 'react';
import LostInterface from "../interfaces/LostInterface";
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from '../context/Provider';
import { checkFields } from '../utils/checkFields'


import EventSelect from './lostform_components/EventSelect';
import NameInput from './lostform_components/NameInput';
import LatitudeInput from './lostform_components/LatitudeInput';
import LongitudeInput from './lostform_components/LongitudeInput';
import TypeInput from './lostform_components/TypeInput';
import EmailInput from './lostform_components/EmailInput';
import CPFInput from './lostform_components/CPFInput';
import DateInput from './lostform_components/DateInput';
import Alert from './lostform_components/Alert';
import FormButtons from './lostform_components/FormButtons';


import checkEvent from '../utils/checkIfEventIsReal';

type Props = {
    lost: LostInterface;
    setLost: React.Dispatch<React.SetStateAction<LostInterface>>;
}

const LostForm: React.FC<Props> = ({ lost, setLost }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [shouldSave, setShouldSave] = useState<boolean>(false);
    const [invalidFields, setInvalidFields] = useState<string[]>([])
    const [alert, setAlert] = useState<{ show: boolean, lostId: number }>({ show: false, lostId: 0})
    const { getLosts, createLost, editLost, deleteLost, setLosts } = useContext(Context);
    const onChangeHandler = (name: string, value: string | number) => {
        setShouldSave(true)
        setLost({ ...lost, [name]: value, })
    }


    const alertInvalidFields = () => {
        setInvalidFields(checkFields(lost))
        setTimeout(() => {
            setInvalidFields([])
        }, 4000)
    }



    const onSubmitHandler = async (e: any) => {
        e.preventDefault()
        const prevData = await getLosts()
        if (checkFields(lost).length) return alertInvalidFields()

        const divergentEvent = checkEvent(prevData, lost)
        if (divergentEvent && divergentEvent.id) {
                return setAlert({ show: true, lostId: Number(divergentEvent.id) })
        }

        if (pathname.includes('details')) {
            if (shouldSave) {
                await editLost(lost)
            }
        } else {
            await createLost(lost)
        }
        const curData = await getLosts()
        setLosts(curData)
        return navigate('/')
    }

    const onDeleteHandler = async () => {
        if (lost.id) {
            await deleteLost(lost.id)
            const data = await getLosts()
            setLosts(data)
            return navigate('/')
        }
    }

    const onCancelHandler = () => navigate('/')

    return (
        <form onSubmit={ (e: any) => onSubmitHandler(e) }>
            <Alert alert={ alert } setAlert={ setAlert } />
            <NameInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
            <div className="row gx-3 mb-3">
                <LatitudeInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
                <LongitudeInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
            </div>
            <div className="row gx-3 mb-3">
                <EventSelect lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
                <TypeInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
            </div>
            <EmailInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
            <div className="row gx-3 mb-3">
                <CPFInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
                <DateInput lost={ lost } onChangeHandler={ onChangeHandler } invalidFields={ invalidFields } />
            </div>
            <FormButtons
                onCancelHandler={ onCancelHandler }
                onDeleteHandler={ onDeleteHandler }
                onSubmitHandler={ onSubmitHandler }
                pathname={ pathname }
                shouldSave={ shouldSave }
            />
        </form>
    )
}

export default LostForm;
