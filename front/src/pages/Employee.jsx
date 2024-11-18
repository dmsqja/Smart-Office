// 임직원 검색 화면 (리스트도 확인)
import EmployeeForm from '../components/employee/EmployeeForm';
import '../styles/pages.css';

const Emp = () => {
    return (
        <div className="page emp-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Employee</span>
                </h1>
            </div>
            <div className="emp-container">
                <EmployeeForm />
            </div>
        </div>
    );
};

export default Emp;