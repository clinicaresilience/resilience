"use client";
import React, { ComponentPropsWithoutRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type CabecalhoProp = ComponentPropsWithoutRef<"header"> & {
  className?: string;
  children?: ReactNode;
};

export default function Cabecalho(props: CabecalhoProp) {
  const { children, className, ...res } = props;
  return (
    <header
      className={twMerge("flex items-center justify-between", className)}
      {...props}
      {...res}
    >
      {children}
    </header>
  );
}
