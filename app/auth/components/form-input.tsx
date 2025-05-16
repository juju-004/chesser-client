"use client";

import React, { ChangeEventHandler } from "react";

function FormInput({
  name,
  type,
  placeholder,
  id,
  onChange,
}: {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className={!onChange ? "mb-6" : ""}>
      <input
        name={name}
        id={id}
        className="input input-lg border-1 w-full rounded-lg duration-150 focus:border-sky-400 focus:outline-0 focus:ring-0"
        type={type || name}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default FormInput;
