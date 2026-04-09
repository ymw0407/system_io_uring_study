---
name: io-uring-content
description: io_uring, liburing, SQPOLL, Queue Depth, interrupt vs polling 관련 본문이나 C 코드를 작성할 때 사용한다. 이 스킬은 기술적 사실의 정확성을 책임지며, liburing API를 상상으로 만들지 않도록 가드레일을 제공한다.
---

# io_uring Content Authoring

## 사실 정확성 원칙

이 페이지는 학부생 독자를 가정하지만, 잘못된 사실을 가르치는 것은 더 나쁘다. 기억이 흐릿한 부분은 추측하지 말고 사용자에게 확인을 요청한다.

## 자주 잘못 쓰는 것들

- `io_uring`은 system call이 아니라 **interface**다. 관련 system call은 `io_uring_setup`, `io_uring_enter`, `io_uring_register`
- **SQPOLL**은 커널 스레드가 SQ를 polling 하는 것이지, 애플리케이션이 polling 하는 것이 아니다. 애플리케이션은 SQE를 큐에 넣기만 하면 system call 없이 커널이 처리한다
- **IOPOLL**은 device-level polling으로, NVMe 같은 polling-capable 디바이스에서 completion을 polling 한다. SQPOLL과 다르다
- **interrupt 방식**이라는 표현은 정확히는 "기본 모드(non-polled completion)"를 의미한다. 본문에서 처음 쓸 때 한 번 명확히 정의하고 이후 약식으로 쓴다
- **Queue Depth**는 동시에 in-flight 상태일 수 있는 요청 수다. SQ 크기와는 다른 개념이다 (SQ 크기 ≥ QD)

## liburing API 사용 시

다음 함수들은 실제로 존재한다. 이 외의 함수를 쓰려면 확인이 필요하다.

- `io_uring_queue_init(unsigned entries, struct io_uring *ring, unsigned flags)`
- `io_uring_queue_init_params(unsigned entries, struct io_uring *ring, struct io_uring_params *p)`
- `io_uring_get_sqe(struct io_uring *ring)`
- `io_uring_prep_read(sqe, fd, buf, nbytes, offset)`
- `io_uring_prep_write(sqe, fd, buf, nbytes, offset)`
- `io_uring_sqe_set_data(sqe, user_data)`
- `io_uring_submit(ring)`
- `io_uring_wait_cqe(ring, cqe_ptr)`
- `io_uring_peek_cqe(ring, cqe_ptr)`
- `io_uring_cqe_seen(ring, cqe)`
- `io_uring_queue_exit(ring)`

플래그:
- `IORING_SETUP_SQPOLL` — kernel-side SQ polling 스레드
- `IORING_SETUP_IOPOLL` — device-level completion polling (O_DIRECT 필요)
- `IORING_SETUP_SQ_AFF` — SQPOLL 스레드를 특정 CPU에 affinity

확실하지 않은 함수는 코드에 쓰기 전에 사용자에게 "이 함수 시그니처를 확인해 주세요"라고 묻는다.

## 코드 템플릿

C 코드는 항상 다음 구조를 따른다:

```c
#include <liburing.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define QD 32
#define BS 4096

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "usage: %s <file>\n", argv[0]);
        return 1;
    }

    int fd = open(argv[1], O_RDONLY | O_DIRECT);
    if (fd < 0) { perror("open"); return 1; }

    struct io_uring ring;
    if (io_uring_queue_init(QD, &ring, 0) < 0) {
        perror("io_uring_queue_init");
        return 1;
    }

    /* ... submit / wait / measure ... */

    io_uring_queue_exit(&ring);
    close(fd);
    return 0;
}
```

빌드: `gcc -O2 -o bench bench.c -luring`

SQPOLL 변형은 init만 다르다:

```c
struct io_uring_params p = {0};
p.flags = IORING_SETUP_SQPOLL;
p.sq_thread_idle = 2000;  // ms
io_uring_queue_init_params(QD, &ring, &p);
```

## 측정값의 현실 범위

본문에 쓰는 수치는 다음 범위를 벗어나면 의심한다:

- NVMe 4KB random read latency: 80~120μs (consumer), 30~80μs (enterprise)
- SATA SSD 4KB random read: 200~500μs
- Context switch overhead: 1~5μs
- SQPOLL 활성 시 IOPS는 일반적으로 interrupt 모드 대비 5~30% 향상 (워크로드 의존)
- SQPOLL은 idle CPU를 소모한다 — 이 trade-off를 본문에서 반드시 언급한다

수치를 만들어 쓸 때는 **"실측 예정"** 또는 **"문헌상 일반적인 범위"** 같은 단서를 단다. 실측한 척하지 않는다.

## Adaptive 정책 서술 시

이 프로젝트의 adaptive 정책은 user-space에서 다음 두 신호로 polling/interrupt를 전환한다:

- **CPU usage**: `/proc/stat` 기반 sampling. 임계값 이상이면 polling을 끈다 (CPU를 양보)
- **Queue Depth**: 현재 in-flight 요청 수. 임계값 이상이면 polling을 켠다 (latency 절감)

이 정책은 단순화된 DPAS의 user-space 변형이며, 커널 모듈을 건드리지 않는다. 본문에서 이 한계를 분명히 한다.

## 회차별 도구 역할 분담

이 프로젝트는 회차마다 사용하는 도구가 다르다. 그 이유를 명확히 해야 한다.

- **1회차 — C (교육)**: liburing으로 io_uring 흐름을 직접 구현한다. 측정 정확성보다 "내가 io_uring으로 파일을 읽었다"는 체험이 목적이다. clock_gettime으로 대강의 latency만 찍는다.
- **2회차 — fio (과학)**: 실험 매트릭스(모드 × QD × CPU load)를 정밀 측정한다. fio는 셸 스크립트 한 장으로 수백 가지 조합을 재현 가능하게 돌릴 수 있다. C로 이 매트릭스를 짜면 수백 줄이고 한 줄 실수하면 전체를 다시 돌려야 한다.
- **3회차 — C (연구)**: fio에는 adaptive 모드가 없다. CPU usage + QD 기반 동적 전환은 직접 C로 구현해야 한다. 이것이 이 과제의 유일한 "새로운 것"이다. 비교는 "adaptive C vs fio interrupt vs fio SQPOLL" 구도이며, harness가 다르다는 한계를 본문에 반드시 명시한다.

## fio 사용 가이드

### io_uring 관련 fio 옵션

- `--ioengine=io_uring` — io_uring 백엔드 사용
- `--sqthread_poll=1` — SQPOLL 모드 활성화 (IORING_SETUP_SQPOLL)
- `--hipri=1` — IOPOLL 모드 활성화 (IORING_SETUP_IOPOLL, O_DIRECT 필수)
- `--iodepth=N` — Queue Depth 설정
- `--fixedbufs=1` — registered buffers 사용
- `--registerfiles=1` — registered files 사용

### 실험 매트릭스 셸 스크립트 템플릿

```bash
#!/bin/bash
MODES=("default" "sqpoll" "iopoll")
QDS=(1 4 16 64 256)
DEVICE="/dev/nvme0n1"
OUTDIR="results"
mkdir -p "$OUTDIR"

for mode in "${MODES[@]}"; do
  EXTRA=""
  if [ "$mode" = "sqpoll" ]; then EXTRA="--sqthread_poll=1"; fi
  if [ "$mode" = "iopoll" ]; then EXTRA="--hipri=1"; fi

  for qd in "${QDS[@]}"; do
    fio --name="${mode}-qd${qd}" \
        --ioengine=io_uring \
        --rw=randread --bs=4k --direct=1 \
        --iodepth="$qd" \
        --filename="$DEVICE" \
        --runtime=30 --time_based \
        --output-format=json \
        $EXTRA \
        --output="${OUTDIR}/${mode}-qd${qd}.json"
  done
done
```

CPU 부하 실험은 별도 루프로 `stress-ng --cpu N`을 배경에 띄우고 같은 매트릭스를 돌린다.

### fio JSON 출력에서 뽑아야 할 필드

- `jobs[0].read.lat_ns.mean` — 평균 지연 (ns)
- `jobs[0].read.lat_ns.percentile["99.000000"]` — p99 지연
- `jobs[0].read.iops` — IOPS
- `jobs[0].read.bw_bytes` — 처리량 (bytes/s)
- `jobs[0].usr_cpu` — 사용자 CPU 사용률 (%)
- `jobs[0].sys_cpu` — 시스템 CPU 사용률 (%)

### 각 도구의 한계

- **C 벤치마크**: 정밀한 워크로드 제어가 어렵다. 측정 harness 자체가 오버헤드를 만들 수 있다. 재현성이 fio보다 낮다.
- **fio**: 내부 구현이 블랙박스다. adaptive 같은 커스텀 정책을 테스트할 수 없다. `--sqthread_poll`의 내부 구현이 직접 짠 코드와 미묘하게 다를 수 있다.
- **혼합 비교의 한계**: 3회차에서 adaptive C와 fio 결과를 비교할 때, harness가 다르다는 점을 반드시 명시한다. 공정한 비교를 위해 동일 디바이스, 동일 블록 크기, 동일 런타임을 맞춘다.

## 작업 전 체크리스트

- [ ] 사용한 liburing 함수가 실제로 존재하는가
- [ ] interrupt/polling 용어를 처음 쓸 때 정의했는가
- [ ] SQPOLL과 IOPOLL을 혼동하지 않았는가
- [ ] 수치가 현실 범위 안에 있는가
- [ ] adaptive 정책의 user-space 한계를 명시했는가
- [ ] 회차별 도구 선택의 이유가 본문에 설명되어 있는가
- [ ] fio 명령의 옵션이 실제로 존재하는가 (상상의 플래그 금지)
- [ ] harness가 다른 결과를 비교할 때 그 한계를 명시했는가
