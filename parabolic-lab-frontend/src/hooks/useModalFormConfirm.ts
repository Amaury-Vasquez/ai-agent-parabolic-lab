import { useRef } from "react";

const useModalFormConfirm = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleConfirmClick = () => {
    formRef.current?.submit();
  };

  return { formRef, handleConfirmClick };
};

export default useModalFormConfirm;
