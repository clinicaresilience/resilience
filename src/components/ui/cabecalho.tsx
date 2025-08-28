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
      className={twMerge(
        `
        flex flex-col sm:flex-row
        items-center sm:items-center
        justify-center sm:justify-between
        gap-4 sm:gap-0
        w-full
        px-4 sm:px-6 lg:px-8
        py-4 sm:py-6
        bg-white
      `,
        className
      )}
      {...props}
      {...res}
    >
      {children}
    </header>
  );
}
