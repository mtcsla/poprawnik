import { HTMLAttributes } from 'react';

export const ExplanationAnimationSvg = ({ style, className }: {
  style?: HTMLAttributes<HTMLOrSVGElement>['style'];
  className?: string;
}) => {
  return <svg className={className} width='100%' viewBox="0 0 1179 796" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      {`
      #form {
        animation: form-in 1s forwards, form-out 1s 5s forwards;
      }
      #value_1{
        transform: translateX(-200%);
      animation: fly-in 1s forwards;
      animation-delay: .3s
  }
      #value_2 {
      transform: translateX(300%);
      animation: fly-in-reverse 1s forwards 1s;
      animation-delay: .5s;
  }
      #phone_ok_circle {
        visibility: hidden;
  }
      #value_3 {
        transform: translateX(-200%);
      animation: fly-in 1s forwards;
      animation-delay: .7s;
  }
      #value_4 {
        transform: translateX(-200%);
      animation: fly-in 1s forwards;
      animation-delay: .8s;
  }
      #value_5 {
        visibility: hidden;
  }

      @keyframes pedestal-in {
        0% {
          transform: translateY(100%);
        }
    100% {
        transform: translateY(0);
    }
  }

      #page {
        transform: translateX(200%);
      animation: printer-in 2s 13.5s forwards,print-page 1s 15.5s forwards, page-move-up 1s 17.5s forwards, page-move-left 1s 20.5s forwards, page-out 2s 30s forwards; 
  }
      #signature {
        font-size: 0px;
      animation: sign 1s 21.5s forwards;
  }

      #cloud_inner {
        opacity: 0;
      animation: cloud-in 0.1s 25.9s forwards, cloud-out 0.1s 26.05s forwards;
  }
      #cloud_outer {
        opacity: 0;
      animation: cloud-in 0.1s 25.95s forwards, cloud-out 0.1s 26.075s forwards;

  }

      #hammer {
        transform: translate(100%, -300%);
      animation: hammer-in 1s ease-in 25s forwards, hammer-out 3s 28s forwards;
  }
      #hammer_stand {
        transform: translateY(200%);
      animation:pedestal-in 2s 22.5s forwards, pedestal-out 2s 29s forwards;
  }
      #printer,#printer_front {
        transform: translateX(200%);
      animation: printer-in 2s 13.5s forwards, printer-out 2s 17.5s forwards;
  }
      #phone {
        transform: translateX(-200%);
      animation: phone-in 2s 5s forwards, phone-out 2s 13s forwards;
  }
      #terminal {
        transform: translateY(200%);
      animation: terminal-in 2s 5s forwards, terminal-out 2s 13s forwards;
  }
      #terminal_back {
        transform: translateY(200%);
      animation: terminal-in 2s 5s forwards, terminal-out 2s 13s forwards;
  }
      #card {
        transform: translateY(-200%);
      animation: card-in 2s 7s forwards, card-out 0.5s 10.5s forwards;
  }
      #terminal_ok_1 {
        font-size: 0px;
      animation: phone-ok 0.25s 11s forwards;
  }
      #terminal_ok_2 {
        font-size: 0px;
      animation: phone-ok 0.25s 11.25s forwards;
  }
      #phone_ok_1 {
        font-size: 0px;
      animation: phone-ok 0.25s 7s forwards;
  }
      #phone_ok_2 {
        font-size: 0px;
      animation: phone-ok 0.25s 7.25s forwards;
  }
      @keyframes sign {
        0% {
          font-size: 0px;
    }
      100% {
        font-size: 16px;
    }
  }
      @keyframes hammer-in {
        0% {
          transform: translate(100%, -300%); 
        }
        30% {
          transform: translate(100%, -250%) rotate(40deg);
        }
    100% {
        transform: translate(0, 0);
    }
  }
      @keyframes hammer-out {
        0% {
          transform: translate(0, 0);
        }
    100% {
        transform: translate(100%, -300%) rotate(-30deg);
    }
  }
      @keyframes printer-in {
        0% {
          transform: translateX(200%);
        }
    100% {
        transform: translateX(0%);
    }
  }
      @keyframes printer-out {
        0% {
          transform: translateY(0%);
        }
    100% {
        transform: translateY(-200%);
    }
  }
      @keyframes print-page {
        0% {
          transform: translate(0%, 0%);
        }
    100% {
        transform: translate(0%, 30%);
    }
  }
      @keyframes page-move-up {
        0% {
          transform: translate(0%, 30%);
        }
    100% {
        transform: translate(0%, 15%);
    }
  }
      @keyframes page-move-left {
        0% {
          transform: translate(0%, 15%);
        }
    100% {
        transform: translate(-25%, 15%);
    }
  }

      @keyframes card-in {
        0% {
          transform: translateY(-200%);
        }
    100% {
        transform: translateX(0%);
    }
  }
      @keyframes card-out {
        0% {
          transform: translateY(0%);
        }
    100% {
        transform: translateY(200%);
    } 
  }
      @keyframes phone-in {
        0% {
          transform: translateY(-200%);
        }
    100% {
        transform: translateY(0);
    }
  }
      @keyframes phone-out {
        0% {
          transform: translateY(0);
        }
    100% {
        transform: translateY(200%);
    }
  }
      @keyframes terminal-in {
        0% {
          transform: translateY(200%);
        }
    100% {
        transform: translateY(0);
    }
  }
      @keyframes terminal-out {
        0% {
          transform: translateY(0);
        }
    100% {
        transform: translateY(200%);
    }
  }

      @keyframes phone-ok {
        0% {
          font-size: 0px;
    }
      100% {
        font-size: 16px;
    }
  }
      @keyframes fly-in {
        0% {
          transform: translateX(-200%);
        }   
    100% {
        transform: translateX(0);
    }
  }
      @keyframes terminal-in-out {
        0% {
          transform: translateY(200%);
        }   
    20% {
        transform: translateY(0);
    }
      80% {
        transform: translateY(0);
    }
      100% {
        transform: translateY(200%);
    }
  }
      @keyframes form-in {
        0% {
          transform: translateX(-200%);
        }   
    100% {
        transform: translateX(0%);
    }
  }
      @keyframes form-out {
        0% {
          transform: translateY(0%);
        }   
    100% {
        transform: translateY(-200%);
    }
  }


      #progress_bar{
        font-size: 0px;
      animation: progress-bar 2s forwards;
      animation-delay: 0s;
  }

      @keyframes progress-bar {
        0% {
          font-size: 0;
    }
      100% {
        font-size: 16px;
    }
  }
      @keyframes cloud-in {
        0% {
          opacity: 0;
        }
    100% {
        opacity: 0.5;
    }
  }
      @keyframes cloud-out {
        0% {
          opacity: 0.5;
        }
    100% {
        opacity: 0;
    }
  }
      @keyframes pedestal-out {
        0% {
          transform: translateY(0);
        }
    100% {
        transform: translateY(200%);
    }
  }
      @keyframes page-out {
        0% {
          transform: translate(-25%, 15%);
        }
    100% {
        transform: translate(-25%, 200%);
    }
  }

      @keyframes fly-in {
        0% {
          transform: translateX(-200%);
        }
    100% {
        transform: translateX(0);
    }
  }
      @keyframes fly-in-reverse {
        0% {
          transform: translateX(200%);
        }
    100% {
        transform: translateX(0);
    }
  }`}
    </style>
    <g id="explanation_animation2 1" clip-path="url(#clip0_1_2)">
      <g id="explanation_animation">
        <g id="form">
          <g id="Rectangle 1">
            <path id="Vector" d="M29 208H1149V704C1149 709 1145 714 1139 714H39C33 714 29 709 29 704V208Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 2">
            <path id="Vector_2" d="M29 88C29 82 33 78 39 78H1139C1145 78 1149 82 1149 88V208H29V88Z" fill="#3B82F6" />
          </g>
          <g id="Rectangle 3">
            <path id="Vector_3" d="M726 109H78C70 109 63 116 63 124V161C63 169 70 176 78 176H726C734 176 741 169 741 161V124C741 116 734 109 726 109Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 4">
            <path id="Vector_4" d="M612 159H83C82 159 81 158 81 157V129C81 128 82 127 83 127H612C613 127 614 128 614 129V157C614 158 613 159 612 159Z" fill="#475569" />
            <path id="Vector_5" d="M612 159H83C82 159 81 158 81 157V129C81 128 82 127 83 127H612C613 127 614 128 614 129V157C614 158 613 159 612 159Z" fill="#475569" />
            <path id="Vector_6" d="M612 159H83C82 159 81 158 81 157V129C81 128 82 127 83 127H612C613 127 614 128 614 129V157C614 158 613 159 612 159Z" fill="#475569" />
          </g>
          <g id="Rectangle 5">
            <path id="Vector_7" d="M723 159H636C635 159 634 158 634 157V129C634 128 635 127 636 127H723C724 127 725 128 725 129V157C725 158 724 159 723 159Z" fill="#475569" />
            <path id="Vector_8" d="M723 159H636C635 159 634 158 634 157V129C634 128 635 127 636 127H723C724 127 725 128 725 129V157C725 158 724 159 723 159Z" fill="#475569" />
            <path id="Vector_9" d="M723 159H636C635 159 634 158 634 157V129C634 128 635 127 636 127H723C724 127 725 128 725 129V157C725 158 724 159 723 159Z" fill="#475569" />
          </g>
          <g id="Rectangle 7">
            <path id="Vector_10" d="M888 238H452C446 238 442 243 442 248V273C442 278 446 283 452 283H888C894 283 898 278 898 273V248C898 243 894 238 888 238Z" fill="#97BEFF" />
            <path id="Vector_11" d="M888 238H452C446 238 442 243 442 248V273C442 278 446 283 452 283H888C894 283 898 278 898 273V248C898 243 894 238 888 238Z" fill="#97BEFF" />
            <path id="Vector_12" d="M888 238H452C446 238 442 243 442 248V273C442 278 446 283 452 283H888C894 283 898 278 898 273V248C898 243 894 238 888 238Z" fill="#97BEFF" />
            <path id="Vector_13" d="M888 238H452C446 238 442 243 442 248V273C442 278 446 283 452 283H888C894 283 898 278 898 273V248C898 243 894 238 888 238Z" fill="#97BEFF" />
            <path id="Vector_14" d="M888 238H452C446 238 442 243 442 248V273C442 278 446 283 452 283H888C894 283 898 278 898 273V248C898 243 894 238 888 238Z" fill="#97BEFF" />
            <path id="Vector_15" d="M888 238H452C446 238 442 243 442 248V273C442 278 446 283 452 283H888C894 283 898 278 898 273V248C898 243 894 238 888 238Z" fill="#97BEFF" />
          </g>
          <rect id="progress_bar" x="442.4" y="238.59" width="21.125em" height="44.52" rx="10" fill="#3B82F6" />
          <g id="Rectangle 9">
            <path id="Vector_16" d="M382 230H319C308 230 299 239 299 250V272C299 283 308 292 319 292H382C393 292 402 283 402 272V250C402 239 393 230 382 230Z" fill="#97BCFA" />
          </g>
          <g id="Group 1">
            <path id="Rectangle 6" d="M888 322H290C284 322 280 327 280 332V667C280 672 284 677 290 677H888C894 677 898 672 898 667V332C898 327 894 322 888 322Z" fill="white" />
            <path id="Rectangle 10" d="M553 351H325C319 351 315 355 315 361V393C315 399 319 403 325 403H553C558 403 563 399 563 393V361C563 355 558 351 553 351Z" fill="#F1F5F9" />
            <path id="Rectangle 11" d="M852 351H624C618 351 614 355 614 361V393C614 399 618 403 624 403H852C857 403 862 399 862 393V361C862 355 857 351 852 351Z" fill="#F1F5F9" />
            <path id="Rectangle 13" d="M853 575H323C318 575 313 580 313 585V638C313 644 318 648 323 648H853C859 648 863 644 863 638V585C863 580 859 575 853 575Z" fill="#F1F5F9" />
            <path id="Rectangle 12" d="M855 446H627C621 446 617 451 617 456V489C617 494 621 499 627 499H855C860 499 865 494 865 489V456C865 451 860 446 855 446Z" fill="#F1F5F9" />
          </g>
          <path id="value_5" d="M841 631H573C572 631 571 630 571 629V595C571 594 572 593 573 593H841C842 593 843 594 843 595V629C843 630 842 631 841 631Z" fill="#475569" />
          <g id="value_4">
            <path id="Vector_17" d="M839 631H337C336 631 335 630 335 629V595C335 594 336 593 337 593H839C840 593 841 594 841 595V629C841 630 840 631 839 631Z" fill="#475569" />
          </g>
          <g id="value_3">
            <path id="Vector_18" d="M841 485H643C642 485 641 484 641 483V463C641 462 642 461 643 461H841C842 461 843 462 843 463V483C843 484 842 485 841 485Z" fill="#475569" />
            <path id="Vector_19" d="M841 485H643C642 485 641 484 641 483V463C641 462 642 461 643 461H841C842 461 843 462 843 463V483C843 484 842 485 841 485Z" fill="#475569" />
            <path id="Vector_20" d="M841 485H643C642 485 641 484 641 483V463C641 462 642 461 643 461H841C842 461 843 462 843 463V483C843 484 842 485 841 485Z" fill="#475569" />
          </g>
          <g id="value_2">
            <path id="Vector_21" d="M841 389H643C642 389 641 388 641 387V367C641 366 642 365 643 365H841C842 365 843 366 843 367V387C843 388 842 389 841 389Z" fill="#475569" />
            <path id="Vector_22" d="M841 389H643C642 389 641 388 641 387V367C641 366 642 365 643 365H841C842 365 843 366 843 367V387C843 388 842 389 841 389Z" fill="#475569" />
            <path id="Vector_23" d="M841 389H643C642 389 641 388 641 387V367C641 366 642 365 643 365H841C842 365 843 366 843 367V387C843 388 842 389 841 389Z" fill="#475569" />
          </g>
          <g id="value_1">
            <path id="Vector_24" d="M538 389H341C339 389 339 388 339 387V367C339 366 339 365 341 365H538C540 365 540 366 540 367V387C540 388 540 389 538 389Z" fill="#475569" />
            <path id="Vector_25" d="M538 389H341C339 389 339 388 339 387V367C339 366 339 365 341 365H538C540 365 540 366 540 367V387C540 388 540 389 538 389Z" fill="#475569" />
            <path id="Vector_26" d="M538 389H341C339 389 339 388 339 387V367C339 366 339 365 341 365H538C540 365 540 366 540 367V387C540 388 540 389 538 389Z" fill="#475569" />
          </g>
        </g>
        <g id="phone">
          <g id="Rectangle 27">
            <path id="Vector_27" d="M42 65C42 59 46 55 52 55H521C526 55 531 59 531 65V733C531 738 526 743 521 743H52C46 743 42 738 42 733V65Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 28">
            <path id="Vector_28" d="M66 87C66 81 70 77 76 77H502C508 77 512 81 512 87V598C512 603 508 608 502 608H76C70 608 66 603 66 598V87Z" fill="#8EB8FD" />
          </g>
          <g id="Rectangle 21">
            <path id="Vector_29" d="M66 87C66 81 70 77 76 77H502C508 77 512 81 512 87V197H66V87Z" fill="#3B82F6" />
          </g>
          <g id="Rectangle 21_2">
            <path id="Vector_30" d="M406 101H100C94 101 90 105 90 111V137C90 142 94 147 100 147H406C412 147 416 142 416 137V111C416 105 412 101 406 101Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 27_2">
            <path id="Vector_31" d="M300 135H108C107 135 106 134 106 133V113C106 112 107 111 108 111H300C301 111 302 112 302 113V133C302 134 301 135 300 135Z" fill="#475569" />
            <path id="Vector_32" d="M300 135H108C107 135 106 134 106 133V113C106 112 107 111 108 111H300C301 111 302 112 302 113V133C302 134 301 135 300 135Z" fill="#475569" />
            <path id="Vector_33" d="M300 135H108C107 135 106 134 106 133V113C106 112 107 111 108 111H300C301 111 302 112 302 113V133C302 134 301 135 300 135Z" fill="#475569" />
          </g>
          <g id="Rectangle 30">
            <path id="Vector_34" d="M398 135H318C317 135 316 134 316 133V113C316 112 317 111 318 111H398C399 111 400 112 400 113V133C400 134 399 135 398 135Z" fill="#475569" />
            <path id="Vector_35" d="M398 135H318C317 135 316 134 316 133V113C316 112 317 111 318 111H398C399 111 400 112 400 113V133C400 134 399 135 398 135Z" fill="#475569" />
            <path id="Vector_36" d="M398 135H318C317 135 316 134 316 133V113C316 112 317 111 318 111H398C399 111 400 112 400 113V133C400 134 399 135 398 135Z" fill="#475569" />
          </g>
          <g id="Rectangle 29">
            <path id="Vector_37" d="M316 622H254C243 622 234 631 234 642V704C234 715 243 724 254 724H316C327 724 336 715 336 704V642C336 631 327 622 316 622Z" fill="#475569" />
          </g>
          <g id="Group 13">
            <path id="phone_ok_1" d="M257 417L289 384" stroke="#75A9FF" stroke-width="4.0625em" />
            <path id="phone_ok_2" d="M286 375L315 404" stroke="#75A9FF" stroke-width="6.25em" />
          </g>
        </g>
        <g id="hammer_stand">
          <g id="Rectangle 67">
            <path id="Vector_38" d="M660 595C660 589 664 585 670 585H1044C1049 585 1054 589 1054 595V642H660V595Z" fill="#64748B" />
          </g>
          <g id="Rectangle 66">
            <path id="Vector_39" d="M603 652C603 646 607 642 613 642H1100C1105 642 1110 646 1110 652V743H603V652Z" fill="#475569" />
          </g>
          <path id="Rectangle 69" d="M603 652C603 646 607 642 613 642H1100C1105 642 1110 646 1110 652V667H603V652Z" fill="#FCD34D" />
        </g>
        <g id="hammer">
          <path id="Rectangle 68" d="M953 383H1585C1591 383 1595 387 1595 393V424C1595 430 1591 434 1585 434H953V383Z" fill="#475569" />
          <path id="Rectangle 71" d="M943 226H762C756 226 752 230 752 236V575C752 580 756 585 762 585H943C949 585 953 580 953 575V236C953 230 949 226 943 226Z" fill="#64748B" />
          <path id="Rectangle 72" d="M953 242H752V269H953V242Z" fill="#FCD34D" />
          <path id="Rectangle 73" d="M953 543H752V570H953V543Z" fill="#FCD34D" />
        </g>
        <g id="terminal_back">
          <path id="Vector_40" d="M1116 108H654C642 108 634 116 634 128V723C634 734 642 743 654 743H1116C1127 743 1136 734 1136 723V128C1136 116 1127 108 1116 108Z" fill="white" />
        </g>
        <g id="card">
          <g id="Rectangle 33">
            <path id="Vector_41" d="M892 59H552C546 59 542 63 542 69V619C542 625 546 629 552 629H892C898 629 902 625 902 619V69C902 63 898 59 892 59Z" fill="#F1F5F9" />
          </g>
          <path id="Rectangle 34" d="M870 59H766V629H870V59Z" fill="#475569" />
        </g>
        <g id="terminal">
          <g id="Rectangle 31">
            <path id="Vector_42" d="M1116 107H808C797 107 788 116 788 127V723C788 734 797 743 808 743H1116C1127 743 1136 734 1136 723V127C1136 116 1127 107 1116 107Z" fill="#89B6FF" />
          </g>
          <g id="Rectangle 36">
            <path id="Vector_43" d="M1087 131H837C826 131 817 140 817 151V319C817 330 826 339 837 339H1087C1098 339 1107 330 1107 319V151C1107 140 1098 131 1087 131Z" fill="#475569" />
          </g>
          <g id="Rectangle 37">
            <path id="Vector_44" d="M1097 363H827C822 363 817 367 817 373V709C817 715 822 719 827 719H1097C1102 719 1107 715 1107 709V373C1107 367 1102 363 1097 363Z" fill="#3B82F6" />
          </g>
          <g id="Rectangle 38">
            <path id="Vector_45" d="M1082 381H842C840 381 837 383 837 386V640C837 643 840 645 842 645H1082C1085 645 1087 643 1087 640V386C1087 383 1085 381 1082 381Z" fill="white" />
          </g>
          <g id="Rectangle 40">
            <path id="Vector_46" d="M905 659H842C840 659 837 662 837 664V694C837 697 840 699 842 699H905C907 699 910 697 910 694V664C910 662 907 659 905 659Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 41">
            <path id="Vector_47" d="M1082 659H1020C1017 659 1015 662 1015 664V694C1015 697 1017 699 1020 699H1082C1085 699 1087 697 1087 694V664C1087 662 1085 659 1082 659Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 42">
            <path id="Vector_48" d="M993 659H931C928 659 926 662 926 664V694C926 697 928 699 931 699H993C996 699 998 697 998 694V664C998 662 996 659 993 659Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 43">
            <path id="Vector_49" d="M910 395H853C850 395 848 397 848 400V464C848 467 850 469 853 469H910C913 469 915 467 915 464V400C915 397 913 395 910 395Z" fill="#475569" />
          </g>
          <g id="Rectangle 44">
            <path id="Vector_50" d="M1071 395H1014C1011 395 1009 397 1009 400V464C1009 467 1011 469 1014 469H1071C1074 469 1076 467 1076 464V400C1076 397 1074 395 1071 395Z" fill="#475569" />
          </g>
          <g id="Rectangle 45">
            <path id="Vector_51" d="M992 395H933C930 395 928 397 928 400V464C928 467 930 469 933 469H992C994 469 997 467 997 464V400C997 397 994 395 992 395Z" fill="#475569" />
          </g>
          <g id="Rectangle 46">
            <path id="Vector_52" d="M910 477H853C850 477 848 479 848 482V546C848 548 850 551 853 551H910C913 551 915 548 915 546V482C915 479 913 477 910 477Z" fill="#475569" />
          </g>
          <g id="Rectangle 47">
            <path id="Vector_53" d="M1071 477H1014C1011 477 1009 479 1009 482V546C1009 548 1011 551 1014 551H1071C1074 551 1076 548 1076 546V482C1076 479 1074 477 1071 477Z" fill="#475569" />
          </g>
          <g id="Rectangle 48">
            <path id="Vector_54" d="M992 477H933C930 477 928 479 928 482V546C928 548 930 551 933 551H992C994 551 997 548 997 546V482C997 479 994 477 992 477Z" fill="#475569" />
          </g>
          <g id="Rectangle 49">
            <path id="Vector_55" d="M910 558H853C850 558 848 560 848 563V627C848 630 850 632 853 632H910C913 632 915 630 915 627V563C915 560 913 558 910 558Z" fill="#475569" />
          </g>
          <g id="Rectangle 50">
            <path id="Vector_56" d="M1071 558H1014C1011 558 1009 560 1009 563V627C1009 630 1011 632 1014 632H1071C1074 632 1076 630 1076 627V563C1076 560 1074 558 1071 558Z" fill="#475569" />
          </g>
          <g id="Rectangle 51">
            <path id="Vector_57" d="M992 558H933C930 558 928 560 928 563V627C928 630 930 632 933 632H992C994 632 997 630 997 627V563C997 560 994 558 992 558Z" fill="#475569" />
          </g>
          <path id="Ellipse 2" d="M873 690C880 690 885 685 885 679C885 673 880 668 873 668C867 668 862 673 862 679C862 685 867 690 873 690Z" stroke="#475569" stroke-width="5" />
          <g id="Group 6">
            <path id="Line 1" d="M948 676L961 690" stroke="#22C55E" stroke-width="5" />
            <path id="Line 2" d="M958 690L977 670" stroke="#22C55E" stroke-width="5" />
          </g>
          <path id="terminal_ok_4" d="M1061 668L1039 689" stroke="#EF4444" stroke-width="5" />
          <path id="terminal_ok_3" d="M1039 669L1061 691" stroke="#EF4444" stroke-width="5" />
          <g id="Group 13_2">
            <path id="terminal_ok_1" d="M932 264L958 238" stroke="#22C55E" stroke-width="3.75em" />
            <path id="terminal_ok_2" d="M966 227L989 250" stroke="#22C55E" stroke-width="6.25em" />
          </g>
        </g>
        <path id="cloud_outer" d="M686.84 488.152C692.489 484.458 695.894 478.163 695.894 471.413V446.444C695.894 441.978 697.388 437.641 700.14 434.123L726.343 400.62C730.133 395.773 735.944 392.941 742.097 392.941H785.255C790.174 392.941 794.905 394.835 798.465 398.23L802.918 402.476C809.764 409.005 820.938 407.277 825.493 398.985C827.592 395.163 831.309 392.497 835.602 391.735L857.383 387.865C861.42 387.148 865.139 385.208 868.036 382.307L879.884 370.442C882.431 367.893 885.618 366.078 889.111 365.191L913.212 359.068C918.418 357.745 923.937 358.572 928.527 361.362L951.238 375.17C952.249 375.784 953.204 376.488 954.091 377.271L979.926 400.096C980.88 400.94 981.752 401.873 982.529 402.882L1013.1 442.581C1015.79 446.079 1017.25 450.369 1017.25 454.784V472.684C1017.25 478.723 1019.98 484.438 1024.68 488.235L1053.58 511.607C1058.27 515.404 1061 521.12 1061 527.158V554.937C1061 564.302 1054.5 572.413 1045.36 574.456L1000.34 584.518C998.909 584.839 997.446 585 995.978 585H855.733H716.084L683.618 581.558C674.642 580.606 667.416 573.761 665.981 564.85L660.739 532.305C660.253 529.288 660.465 526.2 661.358 523.277L666.295 507.129C667.663 502.653 670.558 498.799 674.475 496.238L686.84 488.152Z" fill="#D9D9D9" fill-opacity="0.8" />
        <path id="cloud_inner" d="M734.858 531.585C741.411 528.12 745.51 521.316 745.51 513.903V509.522C745.51 504.332 747.528 499.346 751.136 495.616L765.524 480.744C769.292 476.849 774.479 474.65 779.898 474.65H809.333C812.663 474.65 815.899 475.753 818.535 477.786L822.481 480.827C827.215 484.477 834.045 483.384 837.404 478.44C839.044 476.026 841.625 474.414 844.514 473.999L859.236 471.885C862.807 471.372 866.173 469.903 868.977 467.633L875.255 462.551C877.743 460.537 880.679 459.149 883.815 458.505L899.045 455.377C903.39 454.484 907.909 455.062 911.89 457.019L926.6 464.248C927.578 464.729 928.516 465.289 929.403 465.922L946.852 478.386C947.881 479.12 948.837 479.951 949.709 480.866L968.39 500.478C971.933 504.197 973.909 509.136 973.909 514.272V515.134C973.909 521.885 977.314 528.18 982.965 531.874L995.945 540.36C1001.59 544.054 1005 550.349 1005 557.1V560.223C1005 569.897 998.076 578.185 988.556 579.905L962.12 584.681C960.947 584.893 959.757 585 958.564 585H859.112H759.86L740.949 583.379C732.081 582.619 724.782 576.09 723.043 567.36L721.12 557.71C720.388 554.036 720.703 550.231 722.027 546.727L723.304 543.351C725.028 538.793 728.356 535.022 732.664 532.744L734.858 531.585Z" fill="#64748B" fill-opacity="0.4" />
        <g id="printer">
          <g id="Rectangle 52">
            <path id="Vector_58" d="M1093 302H86C80 302 76 306 76 312V598C76 603 80 608 86 608H1093C1098 608 1103 603 1103 598V312C1103 306 1098 302 1093 302Z" fill="#F1F5F9" />
          </g>
          <g id="Rectangle 53">
            <path id="Vector_59" d="M250 437C250 432 255 427 260 427H909C914 427 919 432 919 437V608H250V437Z" fill="#3B82F6" />
          </g>
          <g id="Rectangle 59">
            <path id="Vector_60" d="M329 471C329 465 333 461 339 461H839C845 461 849 465 849 471V608H329V471Z" fill="#64748B" />
          </g>
          <g id="Rectangle 60">
            <path id="Vector_61" d="M370 506C370 500 374 496 380 496H792C798 496 802 500 802 506V608H370V506Z" fill="#475569" />
          </g>
          <path id="Rectangle 61" d="M785 516H387V536H785V516Z" fill="#323C4A" />
          <g id="Rectangle 63">
            <path id="Vector_65" d="M1054 302H976V608H1054V302Z" fill="white" />
          </g>
        </g>
        <g id="page">
          <g id="Rectangle 65">
            <path id="Vector_62" d="M775 27H395V487H775V27Z" fill="white" />
          </g>
          <path id="Rectangle 74" d="M701 131H466C465 131 464 132 464 133V179C464 180 465 181 466 181H701C702 181 703 180 703 179V133C703 132 702 131 701 131Z" fill="#475569" />
          <path id="Rectangle 82" d="M518 347H442C441 347 440 348 440 349V362C440 364 441 364 442 364H518C519 364 520 364 520 362V349C520 348 519 347 518 347Z" fill="#475569" />
          <g id="Group 11">
            <path id="Rectangle 75" d="M532 216H468C467 216 466 217 466 218V231C466 232 467 233 468 233H532C533 233 534 232 534 231V218C534 217 533 216 532 216Z" fill="#475569" />
            <path id="Rectangle 80" d="M617 281H552C551 281 550 282 550 283V297C550 298 551 299 552 299H617C618 299 619 298 619 297V283C619 282 618 281 617 281Z" fill="#475569" />
            <path id="Rectangle 78" d="M726 248H635C634 248 633 249 633 250V265C633 266 634 267 635 267H726C727 267 728 266 728 265V250C728 249 727 248 726 248Z" fill="#475569" />
            <path id="Rectangle 81" d="M728 281H637C636 281 635 282 635 283V297C635 298 636 299 637 299H728C729 299 730 298 730 297V283C730 282 729 281 728 281Z" fill="#475569" />
            <path id="Rectangle 79" d="M532 281H442C441 281 440 282 440 283V297C440 298 441 299 442 299H532C533 299 534 298 534 297V283C534 282 533 281 532 281Z" fill="#475569" />
            <path id="Rectangle 76" d="M726 216H557C556 216 555 217 555 218V231C555 232 556 233 557 233H726C727 233 728 232 728 231V218C728 217 727 216 726 216Z" fill="#475569" />
            <path id="Rectangle 77" d="M611 248H442C441 248 440 249 440 250V265C440 266 441 267 442 267H611C612 267 613 266 613 265V250C613 249 612 248 611 248Z" fill="#475569" />
          </g>
          <g id="Group 12">
            <path id="Rectangle 75_2" d="M661 57H643C642 57 641 58 641 59V63C641 64 642 65 643 65H661C662 65 663 64 663 63V59C663 58 662 57 661 57Z" fill="#475569" />
            <path id="Rectangle 80_2" d="M689 88H671C670 88 669 89 669 90V94C669 96 670 96 671 96H689C691 96 691 96 691 94V90C691 89 691 88 689 88Z" fill="#475569" />
            <path id="Rectangle 78_2" d="M726 72H698C697 72 696 73 696 74V79C696 80 697 81 698 81H726C727 81 728 80 728 79V74C728 73 727 72 726 72Z" fill="#475569" />
            <path id="Rectangle 81_2" d="M726 88H699C698 88 697 89 697 90V94C697 96 698 96 699 96H726C727 96 728 96 728 94V90C728 89 727 88 726 88Z" fill="#475569" />
            <path id="Rectangle 79_2" d="M661 88H634C633 88 632 89 632 90V94C632 96 633 96 634 96H661C662 96 663 96 663 94V90C663 89 662 88 661 88Z" fill="#475569" />
            <path id="Rectangle 76_2" d="M726 57H672C671 57 670 58 670 59V63C670 64 671 65 672 65H726C727 65 728 64 728 63V59C728 58 727 57 726 57Z" fill="#475569" />
            <path id="Rectangle 77_2" d="M687 72H634C633 72 632 73 632 74V79C632 80 633 81 634 81H687C689 81 689 80 689 79V74C689 73 689 72 687 72Z" fill="#475569" />
          </g>
          <rect id="signature" x="440" y="383" width="9.5em" height="30" rx="2" fill="#3B82F6" />
        </g>
        <g id="printer_front">
          <path id="Rectangle 68_2" d="M785 516H387V526H785V516Z" fill="#323C4A" />
          <path id="Rectangle 67_2" d="M370 506C370 500 374 496 380 496H792C798 496 802 500 802 506V516H370V506Z" fill="#475569" />
          <path id="Rectangle 64" d="M250 437C250 432 255 427 260 427H909C914 427 919 432 919 437V461H250V437Z" fill="#3B82F6" />
          <path id="Rectangle 66_2" d="M329 471C329 465 333 461 339 461H839C845 461 849 465 849 471V496H329V471Z" fill="#64748B" />
          <path id="Rectangle 65_2" d="M1093 302H86C80 302 76 306 76 312V417C76 423 80 427 86 427H1093C1098 427 1103 423 1103 417V312C1103 306 1098 302 1093 302Z" fill="#F1F5F9" />
          <g id="Rectangle 54">
            <path id="Vector_63" d="M290 262C290 259 292 257 295 257H875C877 257 880 259 880 262V302H290V262Z" fill="#97BEFF" />
          </g>
          <g id="empty_page">
            <path id="Vector_64" d="M775 27H395V257H775V27Z" fill="white" />
          </g>
          <path id="printer_red_light" d="M154 360C161 360 167 354 167 347C167 340 161 334 154 334C147 334 141 340 141 347C141 354 147 360 154 360Z" fill="#EF4444" />
          <path id="printer_green_light" d="M207 334H191C188 334 186 336 186 339V355C186 358 188 360 191 360H207C210 360 212 358 212 355V339C212 336 210 334 207 334Z" fill="#22C55E" />
        </g>
      </g>
    </g>
    <defs>
      <filter id="filter0_d_1_2" x="394" y="26" width="384" height="464" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape" />
      </filter>
      <clipPath id="clip0_1_2">
        <rect width="1179" height="796" fill="white" />
      </clipPath>
    </defs>
  </svg>;
};
