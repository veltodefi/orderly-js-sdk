import React, { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useMemo, useRef } from "react";
import { cn } from "tailwind-variants";
import { Flex } from "../flex";
import { Spinner } from "../spinner";
import { EmptyDataState } from "../table";
import { useEndReached } from "./useEndReached";

export interface ListViewProps<T, D> {
  dataSource: T[] | null | undefined;
  renderItem: (item: T, index: number, extraData?: D) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
  loadMore?: () => void;

  style?: React.CSSProperties;

  extraData?: D;
  emptyView?: React.ReactNode;
}

export type ListViewRef = ForwardedRef<{
  scroll: (direction: { x: number; y: number }) => void;
}>;

const ListViewInner = <T, D>(props: ListViewProps<T, D>, ref: ListViewRef) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEndReached(sentinelRef, () => {
    if (!props.isLoading) {
      props.loadMore?.();
    }
  });

  const emptyDataSouce = useMemo(() => {
    return Array.isArray(props.dataSource) && props.dataSource.length <= 0;
  }, [props.dataSource]);

  const listViewElement = useMemo(() => {
    if (!props.dataSource) {
      return null;
    }

    if (emptyDataSouce) {
      return (
        props.emptyView || (
          <Flex
            direction={"column"}
            height={"100%"}
            itemAlign={"center"}
            justify={"center"}
            mt={3}
          >
            <EmptyDataState />
          </Flex>
        )
      );
    }

    return props.dataSource.map((item, index) => (
      <React.Fragment key={index}>
        {props.renderItem(item, index, props.extraData)}
      </React.Fragment>
    ));
  }, [emptyDataSouce, props.dataSource, props.extraData, props.emptyView]);

  const loadingViewElement = useMemo(() => {
    if ((props.dataSource?.length || 0) === 0) return null;
    if (!props.isLoading) {
      return null;
    }

    return (
      <div className="oui-flex oui-items-center oui-justify-center oui-py-2">
        <Spinner />
      </div>
    );
  }, [props.isLoading, props.dataSource]);

  useImperativeHandle(ref, () => {
    return {
      scroll: (direction) => {
        containerRef.current?.scroll({
          left: direction.x,
          top: direction.y,
          behavior: "smooth",
        });
      },
    };
  });

  return (
    <div
      style={props.style}
      ref={containerRef}
      className={cn(
        `oui-custom-scrollbar oui-relative oui-min-h-[180px] ${props.emptyView ? "" : "oui-overflow-auto"}`,
        props.emptyView ? "oui-w-full" : props.className,
      )({
        twMerge: true,
      })}
    >
      <div
        className={cn(
          "oui-size-full oui-space-y-3",
          emptyDataSouce && "oui-absolute oui-inset-0",
          props.contentClassName,
        )({ twMerge: true })}
      >
        {listViewElement}
      </div>
      <div
        ref={sentinelRef}
        className="oui-invisible oui-relative oui-top-[-300px] oui-h-px"
      />
      {loadingViewElement}
    </div>
  );
};

export const ListView = forwardRef(ListViewInner) as <T, D>(
  props: ListViewProps<T, D> & {
    ref?: ForwardedRef<{
      scroll: (direction: { x: number; y: number }) => void;
    }>;
  },
) => JSX.Element;
